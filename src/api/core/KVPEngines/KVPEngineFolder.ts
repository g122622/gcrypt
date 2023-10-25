import fs from "fs-extra";
import KVPEngineBase from "../types/KVPEngineBase";
import EncryptionEngineBase from "../types/EncryptionEngineBase";

const calcDataFileSrc = (entryJsonSrc, dataFileName: string) => {
    let foo = entryJsonSrc.split("/")
    foo.pop()
    foo.push(dataFileName)
    return foo.join("/")
}

class KVPEngineFolder implements KVPEngineBase {
    private encryptionEngine: EncryptionEngineBase
    private storeEntryJsonSrc

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public init = async (storeEntryJsonSrc: string, pwd: string, encryptionEngine, onNewStore: (store) => null) => {
        this.storeEntryJsonSrc = storeEntryJsonSrc
        this.encryptionEngine = encryptionEngine
        this.encryptionEngine.init(pwd)
        try {
            await fs.access(calcDataFileSrc(this.storeEntryJsonSrc, "NEW_STORE_FLAG"))
        } catch {
            await this.setData("NEW_STORE_FLAG", Buffer.from(""))
            await onNewStore(this)
        }
    }

    /**
     * 获取数据
     * @param hash
     */
    public getData = async (hash: string): Promise<Buffer> => {
        try {
            let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, hash)
            await fs.access(dataFilePath)
            const data: Buffer = await fs.readFile(dataFilePath)
            return await this.encryptionEngine.decrypt(data)
        } catch (e) {
            console.error(`这个哈希key不存在`, hash)
            throw e
        }
    }

    /**
     *
     * @param hash 根据已有键去set数据
     * @param buf
     */
    public setData = async (hash: string, buf: Buffer) => {
        let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, hash)
        await fs.writeFile(dataFilePath, await this.encryptionEngine.encrypt(buf))
    }

    /**
     *
     * @param hash 根据已有键去set数据
     * @param buf
     */
    public deleteData = async (hash: string) => {
        let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, hash)
        await fs.unlink(dataFilePath)
    }
}

export default KVPEngineFolder
