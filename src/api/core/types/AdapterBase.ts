
/**
 * 这是adapter的抽象类，是所有adapter的实现标准
 *
 */
abstract class AdapterBase {
    public abstract adapterGuid: string
    public abstract initAdapter
    public abstract changeCurrentDirectory
    public abstract readFile
    public abstract writeFile
    public abstract exists
    public abstract mkdir
    public abstract deleteFile
    public abstract getCurrentFileTable
    // public abstract renameFile
}

export default AdapterBase
