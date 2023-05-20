import { error } from "@/utils/gyConsole";
import sharedUtils from "@/utils/sharedUtils";
import Addr from "../../common/Addr";
import dirSingleItem from "../../types/dirSingleItem";
import fileTable from "../../types/fileTable";
import lodash from "lodash";
import AdapterBase from "@/api/core/types/AdapterBase"

class Adapter extends AdapterBase {
    private KVPEngine
    private encryptionEngine
    private currentDirectory: Addr
    private currentFileTable: fileTable
    private cachedFileTables: Array<{ fileTable: fileTable, dir: Addr }> = []
    public adapterGuid: string
    /**
     * 初始化adapter，若不存在，则根据传入的src的末尾文件名解析出storeName
     * @param storageSrc example:C:/gy/store.json
     * @param pwd
     */
    public initAdapter = async function (storageSrc, pwd, KVPEngine, encryptionEngine, adapterGuid = null) {
        this.adapterGuid = adapterGuid ?? sharedUtils.getHash(16)
        this.KVPEngine = KVPEngine
        this.encryptionEngine = encryptionEngine
        await this.KVPEngine.init(storageSrc, pwd, encryptionEngine)
        this.currentDirectory = new Addr("")
        this.currentFileTable = await this._getFileTable(this.currentDirectory)
    }

    /**
     * 改变当前工作目录
     * @param newDir 新的工作目录
     */
    public changeCurrentDirectory = async function (newDir: Addr) {
        // 没有改变，再见
        if (this.currentDirectory.compareWith(newDir)) {
            return
        }
        // 改变当前工作目录
        this.currentDirectory = lodash.cloneDeep(newDir)
        // 更新文件列表
        this.currentFileTable = await this._getFileTable(newDir)
        this._updateCache()
    }

    /**
     * 缓存文件列表，提高下次访问速率
     */
    private _cacheFileTables = function (fileTable: fileTable, dir: Addr) {
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
    private _updateCache = function (): void {
        this._cacheFileTables(this.currentFileTable, this.currentDirectory)
    }

    /**
     * 核心函数: 根据传入的dir递归遍历文件系统，将找到的filetable传回
     */
    private _getFileTable = async function (dir: Addr): Promise<fileTable> {
        const foo = lodash.cloneDeep(dir)

        // 先查找缓存，看是否命中
        for (let i = 0; i < this.cachedFileTables.length; i++) {
            if (this.cachedFileTables[i].dir.compareWith(foo)) {
                // console.log("cache matched!", newDir, this.cachedFileTables[i].fileTable)
                return this.cachedFileTables[i].fileTable
            }
        }

        // 缓存未命中
        if (foo.isRoot()) {
            const entryKey: string = (await this.KVPEngine.getMeta()).entryKey
            const tempTable: fileTable = <fileTable>JSON.parse((await this.KVPEngine.getData(entryKey)).toString())
            this._cacheFileTables(tempTable, foo)
            return tempTable
        } else {
            foo.up()
            // 查找符合上一层dir的子文件列表，将其应用在本层dir
            const tempTable: fileTable = JSON.parse((await this.readFile(dir.getTopToken(), await this._getFileTable(foo))).toString())
            this._cacheFileTables(tempTable, dir)
            return tempTable
        }
    }

    /**
     * 读取文件
     * @param filename the name of the file to read
     * @param fileTable optional:if provided,this function will search the file in the given file table instead of the this.currentFileTable
     */
    public readFile = async function (filename, fileTable = null): Promise<Buffer> {
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
        return await this.KVPEngine.getData(key)
    }

    /**
     * 写入文件
     * @param filename 文件名
     * @param data Buffer数据或字符串数据
     * @return Promise<文件的唯一标识符key>
     */
    public writeFile = async function (filename: string, data: Buffer | string): Promise<string> {
        if (typeof data === "string") {
            data = Buffer.from(data)
        }

        if (await this.exists(filename)) {
            // [内存]当前文件表修改dirSingleItem，并更新缓存
            const dateNum = Date.now()
            const idx = this.currentFileTable.items.findIndex(item => item.name === filename)
            const foo: dirSingleItem = this.currentFileTable.items[idx]
            foo.meta.modifiedTime = dateNum

            this.currentFileTable.items.push(foo)
            this.currentFileTable.items.splice(idx, 1)
            this._updateCache()

            // [本地]1.保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

            // [本地]2.创建文件数据到本地
            await this.KVPEngine.setData(foo.key, data)
            return foo.key
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
                key: hash,
            }

            this.currentFileTable.items.push(foo)
            this._updateCache()
            // [本地]1.保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

            // [本地]2.创建文件数据到本地
            await this.KVPEngine.setData(hash, data)

            return hash
        }
    }

    /**
     * 当前工作目录是否存在给定文件名
     * @param filename 文件名
     */
    public exists = async function (filename: string): Promise<boolean> {
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
        if (await this.exists(folderName)) {
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

    /**
     * 删除文件系统对象
     * @param filename
     */
    public deleteFile = async (filename: string) => {
        if (!(await this.exists(filename))) {
            error(`文件不存在，无法删除 ${filename}`)
            return
        }

        // 处理递归
        // if (this.currentFileTable.items.find(item=>item.name === filename).type==='folder'){
        // }

        let key = null
        // [内存]修改文件表
        this.currentFileTable.items = this.currentFileTable.items.filter((item) => {
            if (item.name === filename) {
                key = item.key
            }
            return item.name !== filename
        })
        this._updateCache()
        // [本地]删除键值对
        await this.KVPEngine.deleteData(key)
        // [本地]保存更新后的文件列表到本地
        await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
    }

    /**
     * 获取当前文件列表
     */
    public getCurrentFileTable = async function (): Promise<fileTable> {
        return lodash.cloneDeep(this.currentFileTable)
    }

    /**
     * 获取当前存储库的元数据（不是文件的元数据）
     */
    public getMeta = async function () {
        return await this.KVPEngine.getMeta()
    }
}

export default Adapter
