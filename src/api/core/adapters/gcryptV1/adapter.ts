import { error } from "@/utils/gyConsole";
import sharedUtils from "@/utils/sharedUtils";
import Addr from "../../common/Addr";
import dirSingleItem from "../../types/dirSingleItem";
import fileTable from "../../types/fileTable";
import storageLibMetaData from "../../types/storageLibMetaData";
import lodash from "lodash";

class Adapter {
    private KVPEngine
    private encryptionEngine

    private currentDirectory: Addr
    private currentFileTable: fileTable
    private cachedFileTables: Array<{ fileTable: fileTable, dir: Addr }> = []

    public guid: string

    /**
     * 初始化adapter，若不存在，则根据传入的src的末尾文件名解析出storeName
     * @param storageSrc example:C:/gy/store.json
     * @param pwd
     */
    public initAdapter = function (storageSrc, pwd, KVPEngine, encryptionEngine, adapterGuid) {
        this.adapterGuid = adapterGuid
        this.KVPEngine = KVPEngine
        this.encryptionEngine = encryptionEngine
        return new Promise<void>((resolve, reject) => {
            this.KVPEngine.init(storageSrc, pwd, encryptionEngine).then(() => {
                this.currentDirectory = new Addr("")
                this.currentFileTable = this._getFileTable(this.currentDirectory)
                resolve()
            })
        })
    }

    /**
     * 改变当前工作目录
     * @param newDir 新的工作目录
     */
    public changeCurrentDirectory = function (newDir: Addr): void {
        // 没有改变，再见
        if (this.currentDirectory.compareWith(newDir)) {
            return
        }
        // 改变当前工作目录
        this.currentDirectory = lodash.cloneDeep(newDir)
        // 更新文件列表
        this.currentFileTable = this._getFileTable(newDir)
        this._updateCache()
    }

    /**
     * 缓存文件列表，提高下次访问速率
     */
    public _cacheFileTables = function (fileTable: fileTable, dir: Addr) {
        for (let i = 0; i < this.cachedFileTables.length; i++) {
            // 发现之前缓存过一样的dir，那么更新缓存
            if (this.cachedFileTables[i].dir.compareWith(dir)) {
                this.cachedFileTables[i] = lodash.cloneDeep({ fileTable, dir })
                return
            }
        }
        this.cachedFileTables.push(lodash.cloneDeep({ fileTable, dir }))
    }

    /**
     * 根据this.currentFileTable更新cache，在更改了this.currentFileTable时必须调用
     */
    public _updateCache = function (): void {
        this._cacheFileTables(this.currentFileTable, this.currentDirectory)
    }

    /**
     * 根据传入的dir递归遍历文件系统，将找到的filetable传回
     */
    public _getFileTable = function (dir: Addr): fileTable {
        const foo = lodash.cloneDeep(dir)

        // 先查找缓存，看是否命中
        for (let i = 0; i < this.cachedFileTables.length; i++) {
            if (this.cachedFileTables[i].dir.compareWith(foo)) {
                // console.log("cache hitted!", newDir, this.cachedFileTables[i].fileTable)
                return this.cachedFileTables[i].fileTable
            }
        }

        // 缓存未命中
        if (foo.isRoot()) {
            const entryKey: string = this.KVPEngine.getMeta().entryKey
            const tempTable: fileTable = <fileTable>JSON.parse(this.KVPEngine.getData(entryKey).toString())
            this._cacheFileTables(tempTable, foo)
            return tempTable
        } else {
            foo.up()
            // 查找符合上一层dir的子文件列表，将其应用在本层dir
            const tempTable: fileTable = JSON.parse(this.readFile(dir.getTopToken(), this._getFileTable(foo)).toString())
            this._cacheFileTables(tempTable, dir)
            return tempTable
        }
    }

    /**
     * 读取文件
     * @param filename the name of the file to read
     * @param fileTable optional:if provided,this function will search the file in the given file table instead of the this.currentFileTable
     */
    public readFile = function (filename, fileTable = null): Buffer {
        if (!filename) {
            error("地址无效")
            return
        }
        // 拿到key
        let matches: Array<dirSingleItem>
        if (fileTable === null) {
            matches = this.currentFileTable.items.filter(item => item.name === filename)
        } else {
            matches = fileTable.items.filter(item => item.name === filename)
        }
        let key: string = null
        if (matches.length === 0) {
            error("文件不存在")
            throw new Error("")
        }
        key = matches[0].key
        // 取数据
        return this.KVPEngine.getData(key)
    }

    /**
     * 写入数据
     * @param filename 文件名
     * @param data buffer数据
     */
    public writeFile = async function (filename: string, data: Buffer): Promise<void> {
        if (this.exists(filename)) {
            // [内存]当前文件表修改dirSingleItem，并更新缓存
            const dateNum: number = new Date().getTime()
            const foo: dirSingleItem = this.currentFileTable.items.find(item => item.name === filename)
            foo.meta.modifiedTime = dateNum
            this.currentFileTable.items.push(foo)
            this._updateCache()
            // [本地]1.保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

            // [本地]2.创建文件数据到本地
            await this.KVPEngine.setData(foo.key, data)
        } else {
            // [内存]当前文件表增加一个dirSingleItem，并更新缓存
            const dateNum: number = new Date().getTime()
            const hash = sharedUtils.getHash(32)
            const foo: dirSingleItem = {
                name: filename,
                type: "file",
                meta: {
                    modifiedTime: dateNum,
                    createdTime: dateNum,
                    accessedTime: dateNum,
                },
                key: hash
            }

            this.currentFileTable.items.push(foo)
            this._updateCache()
            // [本地]1.保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

            // [本地]2.创建文件数据到本地
            await this.KVPEngine.setData(hash, data)
        }
    }

    /**
     * 当前工作目录是否存在给定文件名
     * @param filename 文件名
     */
    public exists = function (filename: string): boolean {
        const matches = this.currentFileTable.items.filter(item => item.name === filename)
        if (matches.length === 0) {
            return false
        } else {
            return true
        }
    }

    /**
     * 创建文件夹
     * @param folderName 文件夹名
     */
    public mkdir = async function (folderName: string): Promise<void> {
        // if names conflict
        if (this.exists(folderName)) {
            console.error("文件夹已存在");
            return
        }
        // [内存]当前文件表增加一个dirSingleItem，并更新缓存
        const dateNum: number = new Date().getTime()
        const hash = sharedUtils.getHash(32)
        const foo: dirSingleItem = {
            name: folderName,
            type: "folder",
            meta: {
                modifiedTime: dateNum,
                createdTime: dateNum,
                accessedTime: dateNum,
            },
            key: hash
        }

        this.currentFileTable.items.push(foo)
        this._updateCache()
        // [本地]1.保存更新后的文件列表到本地
        await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

        // [本地]2.创建新的文件列表到本地
        const fileTableData: fileTable = {
            selfKey: hash,
            items: []
        }
        await this.KVPEngine.setData(hash, Buffer.from(JSON.stringify(fileTableData)))
    }

    public deleteFile = async (filename: string) => {
        if (!this.exists(filename)) {
            error(`文件不存在，无法删除 ${filename}`)
        }
        this.currentFileTable.items = this.currentFileTable.items.filter((item) => {
            return item.name !== filename
        })
        this._updateCache()
        // [本地]保存更新后的文件列表到本地
        await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
    }

    /**
     * 获取当前文件列表
     */
    public getCurrentFileTable = function (): fileTable {
        return this.currentFileTable
    }

    /**
     * 获取当前存储库的元数据（不是文件的元数据）
     */
    public getMeta = function () {
        return this.KVPEngine.getMeta()
    }
}

export default Adapter
