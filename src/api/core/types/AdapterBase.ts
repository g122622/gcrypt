import Addr from "../common/Addr"
import fileTable from "./fileTable"

/**
 * 这是adapter的抽象类，是所有adapter的实现标准
 *
 */
abstract class AdapterBase {
    public abstract adapterGuid: string
    public abstract initAdapter
    public abstract changeCurrentDirectory
    public abstract readFile(filename, dir?: Addr): Promise<Buffer>
    public abstract writeFile(filename: string, data: Buffer | string, dir?: Addr): Promise<string>
    public abstract exists(filename: string, dir?: Addr): Promise<boolean>
    public abstract mkdir(folderName: string, dir?: Addr): Promise<void>
    public abstract deleteFile(filename: string, dir?: Addr): void
    public abstract getCurrentFileTable(): Promise<fileTable>
    public abstract getCurrentDirectory(): Addr
    // public abstract renameFile
}

export default AdapterBase
