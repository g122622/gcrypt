
/**
 * 这是KVPEngine的抽象类，是所有KVPEngine的实现标准
 *
 */
abstract class KVPEngineBase {
    public abstract init
    public abstract getData
    public abstract setData
    public abstract deleteData
}

export default KVPEngineBase
