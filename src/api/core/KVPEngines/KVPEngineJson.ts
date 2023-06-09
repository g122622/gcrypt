import fs from "fs-extra";
import KVPEngineBase from "../types/KVPEngineBase";

const calcDataJsonSrc = (entryJsonSrc, dataJsonFileName: string) => {
    let foo = entryJsonSrc.split("/")
    foo.pop()
    foo.push(dataJsonFileName)
    return foo.join("/")
}

class KVPEngineJson extends KVPEngineBase {
    private currentJson = null
    private currentDataJsonSrc: string = null
    private encryptionEngine

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public init = async (storeEntryJsonSrc: string, pwd: string, encryptionEngine, onNewStore: (store) => null) => {
        this.currentDataJsonSrc = calcDataJsonSrc(storeEntryJsonSrc, "data.json")
        this.encryptionEngine = encryptionEngine
        this.encryptionEngine.init(pwd)

        if (fs.existsSync(this.currentDataJsonSrc)) {
            this.currentJson = JSON.parse(await fs.readFile(this.currentDataJsonSrc, 'utf-8'))
        } else {
            await this.createNewStore()
            await onNewStore(this)
        }
    }

    /**
     * 在内存中创建一个空的存储库
     * @param storageName
     * @param comment
     */
    public getEmptyJson = () => {
        const res = {
            data: {},
            extra: {}
        }
        return res
    }

    /**
     * 将内存和本地数据同步
     */
    private sync = async () => {
        await fs.writeFile(this.currentDataJsonSrc, JSON.stringify(this.currentJson))
    }

    /**
     * 在本地创建一个新的库
     * @param src
     * @param storageName
     * @param comment
     */
    private createNewStore = async () => {
        this.currentJson = this.getEmptyJson()
        await this.sync()
    }

    /**
     * 获取数据
     * @param hash
     */
    public getData = async (hash: string): Promise<Buffer> => {
        // eslint-disable-next-line dot-notation
        if (Object['hasOwn'](this.currentJson.data, hash)) {
            const data: string = this.currentJson.data[hash]
            return this.encryptionEngine.decrypt(data)
        } else {
            console.error(`这个哈希key不存在`, hash, this.currentJson)
        }
    }

    /**
     *
     * @param hash 根据已有键去set数据
     * @param buf
     */
    public setData = async (hash: string, buf: Buffer) => {
        this.currentJson.data[hash] = this.encryptionEngine.encrypt(buf)
        await this.sync()
    }

    /**
     *
     * @param hash 根据已有键去set数据
     * @param buf
     */
    public deleteData = async (hash: string) => {
        delete this.currentJson.data[hash]
        await this.sync()
    }
}

export default KVPEngineJson
