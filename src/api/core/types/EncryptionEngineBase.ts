/**
 * 这是EncryptionEngine的抽象类，是所有EncryptionEngine的实现标准
 *
 */
abstract class EncryptionEngineBase {
    public abstract init(pwd: string): void;
    public abstract encrypt(rawData: Buffer): Promise<Buffer>;
    public abstract decrypt(rawData: Buffer): Promise<Buffer>;
}

export default EncryptionEngineBase;
