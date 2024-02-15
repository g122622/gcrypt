/**
 * File: \src\api\core\adapters\localFiles\adapter.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-15 11:28:49
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import { error } from "@/utils/gyConsole";
import sharedUtils from "@/utils/sharedUtils";
import Addr from "@/api/core/common/Addr";
import DirSingleItem from "@/api/core/types/DirSingleItem";
import FileTable from "@/api/core/types/FileTable";
import lodash from "lodash";
import AdapterBase from "@/api/core/types/AdapterBase"
import fs from "fs-extra";
import path from 'path'

const forbiddenDirents = ["System Volume Information",
    "$RECYCLE.BIN",
    "desktop.ini",
    "DumpStack.log.tmp",
    "Config.Msi",
    "DumpStack.log",
    "WindowsApps",
    "pagefile.sys"]

class LocalFileAdapter implements AdapterBase {
    private currentDirectory: Addr
    private currentFileTable: FileTable
    public adapterGuid: string

    /**
     * 初始化adapter
     * @param initialDirectory
     * @param adapterGuid
     */
    public initAdapter = async function (initialDirectory: string, adapterGuid = null) {
        this.adapterGuid = adapterGuid ?? sharedUtils.getHash(16)
        this.currentDirectory = new Addr(initialDirectory)
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
        // 改变当前工作目录
        this.currentDirectory = lodash.cloneDeep(newDir)
        // 更新文件列表
        this.currentFileTable = await this._getFileTable(newDir)
    }

    private async _getFileTable(dir: Addr): Promise<FileTable> {
        const res: FileTable = { items: [] as DirSingleItem[], selfKey: '' }
        const pathBase = dir.toPathStr()
        try {
            let dirs = await fs.readdir(pathBase);
            for (const dirent of dirs) {
                try {
                    if (!forbiddenDirents.includes(dirent)) {
                        // console.log(pathBase, dirent, path.join(pathBase, dirent))
                        const stats = await fs.stat(path.join(pathBase, dirent))
                        res.items.push({
                            name: dirent,
                            type: stats.isDirectory() ? 'folder' : 'file',
                            key: dirent,
                            meta: {
                                accessedTime: stats.atime.getTime(),
                                createdTime: stats.ctime.getTime(),
                                modifiedTime: stats.mtime.getTime(),
                                size: stats.size
                            },
                            isSymlink: false,
                            extraMetaKeysList: []
                        })
                    }
                } catch (e) { }
            }
            return res
        } catch (err) {
            console.log(err)
            throw err
        } finally {
            // await fsdir.close()
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
        if (dir) {
            return await fs.readFile(path.join(dir.toPathStr(), filename))
        } else {
            return await fs.readFile(path.join(this.currentDirectory.toPathStr(), filename))
        }
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
        await fs.writeFile(path.join(this.currentDirectory.toPathStr(), filename), bufData)

        await this.changeCurrentDirectory(oldDir)
        return filename
    }

    /**
     * 当前工作目录是否存在给定文件名
     * @param filename 文件名
     */
    public exists = async function (filename: string, dir?: Addr): Promise<boolean> {
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
    public mkdir = async function (folderName: string, dir?: Addr): Promise<void> {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        // if names conflict
        if (await this.exists(folderName)) {
            error("文件夹已存在");
            await this.changeCurrentDirectory(oldDir)
            return
        }
        await fs.mkdir(path.join(this.currentDirectory.toPathStr(), folderName))

        await this.changeCurrentDirectory(oldDir)
    }

    /**
     * 删除文件系统对象
     * @param filename
     */
    public deleteFile = async (filename: string, dir?: Addr) => {
        let oldDir = this.currentDirectory
        await this.changeCurrentDirectory(dir)

        if (!(await this.exists(filename))) {
            error(`文件不存在，无法删除 ${filename}`)
            await this.changeCurrentDirectory(oldDir)
            return
        }

        await fs.unlink(path.join(this.currentDirectory.toPathStr(), filename))

        await this.changeCurrentDirectory(oldDir)
    }

    /**
     * 获取当前文件列表
     */
    public getCurrentFileTable = async function (): Promise<FileTable> {
        return lodash.cloneDeep(this.currentFileTable)
    }

    public getCurrentDirectory = function (): Addr {
        return lodash.cloneDeep(this.currentDirectory)
    }
}

export default LocalFileAdapter
