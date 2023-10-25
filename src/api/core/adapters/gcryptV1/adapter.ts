import { error } from "@/utils/gyConsole";
import sharedUtils from "@/utils/sharedUtils";
import Addr from "@/api/core/common/Addr";
import dirSingleItem from "@/api/core/types/dirSingleItem";
import fileTable from "@/api/core/types/fileTable";
import lodash from "lodash";
import AdapterBase from "@/api/core/types/AdapterBase"
import KVPEngineBase from "@/api/core/types/KVPEngineBase";
import calcBufSize from "@/utils/calcBufSize";

class GcryptV1Adapter implements AdapterBase {
    private KVPEngine: KVPEngineBase
    private encryptionEngine
    private currentDirectory: Addr
    private currentFileTable: fileTable
    private cachedFileTables: Array<{ fileTable: fileTable, dir: Addr }> = []
    private storageEntrySrc
    public adapterGuid: string

    /**
     * 初始化adapter，若不存在，则根据传入的src的末尾文件名解析出storeName
     * @param storageEntrySrc example:C:/gy/store.json
     * @param pwd
     */
    public async initAdapter(storageEntrySrc, pwd, KVPEngine: KVPEngineBase, encryptionEngine, adapterGuid = null) {
        this.adapterGuid = adapterGuid ?? sharedUtils.getHash(16)
        this.KVPEngine = KVPEngine
        this.encryptionEngine = encryptionEngine
        this.storageEntrySrc = storageEntrySrc
        await this.KVPEngine.init(storageEntrySrc, pwd, encryptionEngine, async (store: KVPEngineBase) => {
            // 若为第一次使用该库，则初始化
            const entryKey = sharedUtils.getHash(32)
            // 准备根目录filetable
            const fileTableData: fileTable = {
                selfKey: entryKey,
                items: []
            }
            await store.setData("entryKey", Buffer.from(entryKey))
            await store.setData(entryKey, Buffer.from(JSON.stringify(fileTableData)))
        })
        this.currentDirectory = new Addr("")
        this.currentFileTable = await this._getFileTable(this.currentDirectory)
    }

    /**
     * 改变当前工作目录
     * @param newDir 新的工作目录
     */
    public async changeCurrentDirectory(newDir: Addr) {
        if (!newDir) {
            return
        }
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
    private _cacheFileTables(fileTable: fileTable, dir: Addr) {
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
    private _updateCache(): void {
        this._cacheFileTables(this.currentFileTable, this.currentDirectory)
    }

    /**
     * 核心函数: 根据传入的dir递归遍历文件系统，将找到的filetable传回
     */
    private async _getFileTable(dir: Addr): Promise<fileTable> {
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
            const entryKey: string = (await this.KVPEngine.getData("entryKey")).toString()
            const tempTable: fileTable = JSON.parse((await this.KVPEngine.getData(entryKey)).toString())
            this._cacheFileTables(tempTable, foo)
            return tempTable
        } else {
            foo.up()
            // 查找符合上一层dir的子文件列表，将其应用在本层dir
            const tempTable: fileTable = JSON.parse((await this.readFile(dir.getTopToken(), foo)).toString())
            this._cacheFileTables(tempTable, dir)
            return tempTable
        }
    }

    /**
     * 读取文件
     * @param filename the name of the file to read
     * @param fileTable optional:if provided,this function will search the file in the given file table instead of the this.currentFileTable
     */
    public async readFile(filename, dir?: Addr): Promise<Buffer> {
        if (!filename) {
            error("地址无效")
            return
        }
        // 拿到key
        let matches: Array<dirSingleItem>
        if (dir) {
            const fileTable = await this._getFileTable(dir)
            matches = fileTable.items.filter(item => item.name === filename)
        } else {
            matches = this.currentFileTable.items.filter(item => item.name === filename)
        }

        if (matches.length === 0) {
            error("文件不存在")
            throw new Error("")
        }
        // 取数据
        return await this.KVPEngine.getData(matches[0].key)
    }

    /**
     * 写入文件
     * @param filename 文件名
     * @param data Buffer数据或字符串数据
     * @return Promise<文件的唯一标识符key>
     */
    public async writeFile(filename: string, data: Buffer | string, dir?: Addr): Promise<string> {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        let bufData: Buffer = typeof data === "string" ? Buffer.from(data) : data
        let key: string
        let newDirItem: dirSingleItem
        const currentDate = Date.now()

        // [内存]当前文件表增加一个dirSingleItem，并更新缓存
        if (await this.exists(filename)) {
            const idx = this.currentFileTable.items.findIndex(item => item.name === filename)
            newDirItem = this.currentFileTable.items.splice(idx, 1)[0]
            key = newDirItem.key
            // 修改元数据
            newDirItem.meta.modifiedTime = currentDate
            newDirItem.meta.size = calcBufSize(bufData)
        } else {
            key = sharedUtils.getHash(32)
            newDirItem = {
                name: filename,
                type: "file",
                meta: {
                    modifiedTime: currentDate,
                    createdTime: currentDate,
                    accessedTime: currentDate,
                    size: calcBufSize(bufData)
                },
                key
            }
        }

        this.currentFileTable.items.push(newDirItem)
        this._updateCache()
        // [本地]1.保存更新后的文件列表到本地
        await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
        // [本地]2.创建文件数据到本地
        await this.KVPEngine.setData(key, bufData)

        await this.changeCurrentDirectory(oldDir)
        return key
    }

    /**
     * 当前工作目录是否存在给定文件名
     * @param filename 文件名
     */
    public async exists(filename: string, dir?: Addr): Promise<boolean> {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)
        const matches = this.currentFileTable.items.filter(item => item.name === filename)
        await this.changeCurrentDirectory(oldDir)
        return !(matches.length === 0)
    }

    /**
     * 创建文件夹
     * @param folderName 文件夹名
     */
    public async mkdir(folderName: string, dir?: Addr): Promise<void> {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        // if names conflict
        if (await this.exists(folderName)) {
            console.error("文件夹已存在");
            await this.changeCurrentDirectory(oldDir)
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
                size: -1
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

        await this.changeCurrentDirectory(oldDir)
    }

    /**
     * 删除文件系统对象
     * @param filename
     */
    public async deleteFile(filename: string, dir?: Addr) {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        if (!(await this.exists(filename))) {
            error(`文件不存在，无法删除 ${filename}`)
            await this.changeCurrentDirectory(oldDir)
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
        await this.changeCurrentDirectory(oldDir)
    }

    public async renameFile(oldname: string, newname: string, dir?: Addr) {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        if (await this.exists(oldname)) {
            // [内存]修改当前文件表dirSingleItem
            const idx = this.currentFileTable.items.findIndex(item => item.name === oldname)
            const newDirItem = this.currentFileTable.items.splice(idx, 1)[0]
            // 修改元数据
            newDirItem.name = newname
            newDirItem.meta.modifiedTime = Date.now()
            this.currentFileTable.items.push(newDirItem)
            // 更新缓存
            this._updateCache()
            // [本地]保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
        }

        await this.changeCurrentDirectory(oldDir)
    }

    /**
     * 获取当前文件列表
     */
    public async getCurrentFileTable(): Promise<fileTable> {
        return lodash.cloneDeep(this.currentFileTable)
    }

    public getCurrentDirectory = function () {
        return lodash.cloneDeep(this.currentDirectory)
    }
}

export default GcryptV1Adapter
