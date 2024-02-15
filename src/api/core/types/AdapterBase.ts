/**
 * File: \src\api\core\types\AdapterBase.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-15 11:13:37
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import Addr from "../common/Addr"
import FileTable from "./FileTable"
import KVPEngineBase from "./KVPEngineBase"

/**
 * 这是adapter的抽象类，是所有adapter的实现标准
 * 必须用implements关键字，而非extends，否则会导致可选属性（带问号的）变为必须实现的属性
 */
abstract class AdapterBase {
    public abstract adapterGuid: string
    // public abstract initAdapter(KVPEngine?: KVPEngineBase, adapterGuid?: string): Promise<void>
    public abstract initAdapter(...args: any[]): Promise<void>
    public abstract changeCurrentDirectory(newDir: Addr): Promise<void>
    public abstract readFile(filename: string, dir?: Addr): Promise<Buffer>
    public abstract writeFile(filename: string, data: Buffer | string, dir?: Addr): Promise<string>
    public abstract exists(filename: string, dir?: Addr): Promise<boolean>
    public abstract mkdir(folderName: string, dir?: Addr): Promise<void>
    public abstract deleteFile(filename: string, dir?: Addr): void
    public abstract getCurrentFileTable(): Promise<FileTable>
    public abstract getCurrentDirectory(): Addr

    // 可选功能
    public abstract renameFile?: (oldname: string, newname: string, dir?: Addr) => Promise<void>
    public abstract copyFile?: (filename: string, srcdir: Addr, dstdir: Addr) => Promise<void>
    public abstract createSymlink?: (objname: string, srcdir: Addr, dstdir: Addr) => Promise<void>
    public abstract moveFile?: (filename: string, srcdir: Addr, dstdir: Addr) => Promise<void>
    public abstract getExtraMeta?: (fileKey: string, metaKey: string) => Promise<Buffer | null>
    public abstract setExtraMeta?: (fileKey: string, metaKey: string, value: Buffer) => Promise<void>
    public abstract deleteExtraMeta?: (fileKey: string, metaKey: string) => Promise<void>
}

export default AdapterBase
