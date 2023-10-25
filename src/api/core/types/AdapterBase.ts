import Addr from "../common/Addr"
import fileTable from "./fileTable"

/**
 * 这是adapter的抽象类，是所有adapter的实现标准
 * 必须用implements关键字，而非extends，否则会导致可选属性（带问号的）变为必须实现的属性
 */
abstract class AdapterBase {
    public abstract adapterGuid: string
    public abstract initAdapter
    public abstract changeCurrentDirectory(newDir: Addr): Promise<void>
    public abstract readFile(filename, dir?: Addr): Promise<Buffer>
    public abstract writeFile(filename: string, data: Buffer | string, dir?: Addr): Promise<string>
    public abstract exists(filename: string, dir?: Addr): Promise<boolean>
    public abstract mkdir(folderName: string, dir?: Addr): Promise<void>
    public abstract deleteFile(filename: string, dir?: Addr): void
    public abstract getCurrentFileTable(): Promise<fileTable>
    public abstract getCurrentDirectory(): Addr
    public abstract renameFile?: (oldname: string, newname: string, dir?: Addr) => Promise<void>
    public abstract copyFile?: (src: Addr, dst: Addr) => Promise<void>
    public abstract cutFile?: (src: Addr, dst: Addr) => Promise<void>
}

export default AdapterBase
