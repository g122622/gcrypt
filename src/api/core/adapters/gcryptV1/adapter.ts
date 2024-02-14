/**
 * File: \src\api\core\adapters\gcryptV1\adapter.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 11:57:13
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import sharedUtils from "@/utils/sharedUtils";
import Addr from "@/api/core/common/Addr";
import DirSingleItem from "@/api/core/types/DirSingleItem";
import FileTable from "@/api/core/types/FileTable";
import lodash from "lodash";
import AdapterBase from "@/api/core/types/AdapterBase"
import KVPEngineBase from "@/api/core/types/KVPEngineBase";
import calcBufSize from "@/utils/calcBufSize";

class GcryptV1Adapter implements AdapterBase {
    private KVPEngine: KVPEngineBase
    private currentDirectory: Addr
    private currentFileTable: FileTable
    private cachedFileTables: Array<{ fileTable: FileTable, dir: Addr }> = []
    public adapterGuid: string

    /**
     * 初始化adapter，若不存在，则根据传入的src的末尾文件名解析出storeName
     * @param storageEntrySrc example:C:/gy/store.json
     * @param pwd
     */
    public async initAdapter(storageEntrySrc, pwd, KVPEngine: KVPEngineBase, encryptionEngine, adapterGuid = null) {
        this.adapterGuid = adapterGuid ?? sharedUtils.getHash(16)
        this.KVPEngine = KVPEngine
        await this.KVPEngine.init(storageEntrySrc, pwd, encryptionEngine, async (store: KVPEngineBase) => {
            // 若为第一次使用该库，则初始化
            const entryKey = sharedUtils.getHash(32)
            // 准备根目录filetable
            const fileTableData: FileTable = {
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
    private _cacheFileTables(fileTable: FileTable, dir: Addr) {
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
    private async _getFileTable(dir: Addr): Promise<FileTable> {
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
            const tempTable: FileTable = JSON.parse((await this.KVPEngine.getData(entryKey)).toString())
            this._cacheFileTables(tempTable, foo)
            return tempTable
        } else {
            foo.up()
            // 查找符合上一层dir的子文件列表，将其应用在本层dir
            const tempTable: FileTable = JSON.parse((await this.readFile(dir.getTopToken(), foo)).toString())
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
            throw new Error("GcryptV1Adapter::InvalidFileName")
        }
        // 拿到key
        let match: DirSingleItem
        if (dir) {
            const fileTable = await this._getFileTable(dir)
            match = fileTable.items.find(item => item.name === filename)
        } else {
            match = this.currentFileTable.items.find(item => item.name === filename)
        }
        if (!match) {
            throw new Error("GcryptV1Adapter::NotExisted")
        }
        // 取数据
        return await this.KVPEngine.getData(match.key)
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
        let newDirItem: DirSingleItem
        const currentDate = Date.now()

        // [内存]当前文件表增加一个DirSingleItem，并更新缓存
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
                key,
                isSymlink: false,
                extraMetaKeysList: []
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
        const match = this.currentFileTable.items.find(item => item.name === filename)
        await this.changeCurrentDirectory(oldDir)
        return !!match
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
            await this.changeCurrentDirectory(oldDir)
            throw new Error("GcryptV1Adapter::mkdir::FolderAlreadyExisted: " + folderName)
        }
        // [内存]当前文件表增加一个DirSingleItem，并更新缓存
        const dateNum: number = new Date().getTime()
        const hash = sharedUtils.getHash(32)
        const foo: DirSingleItem = {
            name: folderName,
            type: "folder",
            meta: {
                modifiedTime: dateNum,
                createdTime: dateNum,
                accessedTime: dateNum,
                size: -1
            },
            key: hash,
            isSymlink: false,
            extraMetaKeysList: []
        }

        this.currentFileTable.items.push(foo)
        this._updateCache()
        // [本地]1.保存更新后的文件列表到本地
        await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))

        // [本地]2.创建新的文件列表到本地
        const fileTableData: FileTable = {
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
            await this.changeCurrentDirectory(oldDir)
            throw new Error("GcryptV1Adapter::NotExisted")
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

    /**
     * 重命名文件
     * @param oldname
     * @param newname
     * @param dir
     */
    public async renameFile(oldname: string, newname: string, dir?: Addr) {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        if (await this.exists(oldname)) {
            // [内存]修改当前文件表DirSingleItem
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
     * 创建文件系统对象的符号链接
     * @param objname
     * @param srcdir
     * @param dstdir
     */
    public async createSymlink(objname: string, srcdir: Addr, dstdir: Addr) {
        const oldDir = this.currentDirectory
        await this.changeCurrentDirectory(srcdir)

        if (await this.exists(objname)) {
            // [内存]获取文件名对应的src目录项
            const srcFileItem = this.currentFileTable.items.find(item => item.name === objname)
            // [内存]修改dst文件表
            await this.changeCurrentDirectory(dstdir)
            this.currentFileTable.items.push({ ...srcFileItem, isSymlink: true })
            // 更新缓存
            this._updateCache()
            // [本地]保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
        }

        await this.changeCurrentDirectory(oldDir)
    }

    /**
    * 移动文件
    * warning：涉及到两个目录的改写，需要先后两次更新缓存，并且保存两次！
    * @param filename
    * @param srcdir
    * @param dstdir
    */
    public async moveFile(filename: string, srcdir: Addr, dstdir: Addr) {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(srcdir)

        if (await this.exists(filename)) {
            // [内存]获取文件名对应的src目录项，并且删除
            const idx = this.currentFileTable.items.findIndex(item => item.name === filename)
            const srcFileItem = this.currentFileTable.items.splice(idx, 1)[0]
            // 第一次更新缓存
            this._updateCache()
            // [本地]保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
            // [内存]跳转到dst，修改dst文件表
            await this.changeCurrentDirectory(dstdir)
            this.currentFileTable.items.push(srcFileItem)
            // 第二次更新缓存
            this._updateCache()
            // [本地]保存更新后的文件列表到本地
            await this.KVPEngine.setData(this.currentFileTable.selfKey, Buffer.from(JSON.stringify(this.currentFileTable)))
        } else {
            throw new Error("GcryptV1Adapter::NotExisted")
        }

        await this.changeCurrentDirectory(oldDir)
    }

    /**
     * 获取额外元数据
     * @param fileKey 不是文件名，长度为32的16进制字符串
     * @param metaKey 长度随意的任意字符串
     * @returns
     */
    public async getExtraMeta(fileKey: string, metaKey: string): Promise<Buffer | null> {
        if (!fileKey) {
            throw new Error("GcryptV1Adapter::InvalidKey")
        }
        // 取数据
        return (await this.KVPEngine.getData(fileKey + metaKey)) ?? null
    }

    /**
     * 设置额外元数据
     * @param fileKey 不是文件名
     * @param metaKey 长度随意的任意字符串
     * @param value 元数据值
     */
    public async setExtraMeta(fileKey: string, metaKey: string, value: Buffer): Promise<void> {
        if (!fileKey || !metaKey) {
            throw new Error("GcryptV1Adapter::InvalidKey")
        }
        await this.KVPEngine.setData(fileKey + metaKey, value)
        // await this.KVPEngine.setData('[ExtraMetaKeyList]' + fileKey, Buffer.from(metaKey))
    }

    /**
    * 删除额外元数据
     * @param fileKey 不是文件名
     * @param metaKey 长度随意的任意字符串
    */
    public async deleteExtraMeta(fileKey: string, metaKey: string): Promise<void> {
        if (!fileKey || !metaKey) {
            throw new Error("GcryptV1Adapter::InvalidKey")
        }
        await this.KVPEngine.deleteData(fileKey + metaKey)
    }

    /**
     * 获取当前文件列表
     */
    public async getCurrentFileTable(): Promise<FileTable> {
        return lodash.cloneDeep(this.currentFileTable)
    }

    public getCurrentDirectory(): Addr {
        return lodash.cloneDeep(this.currentDirectory)
    }
}

export default GcryptV1Adapter
