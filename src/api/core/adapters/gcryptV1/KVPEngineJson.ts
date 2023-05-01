import sharedUtils from "../../../../utils/sharedUtils"
import storageLibMetaData from "../../types/storageLibMetaData"
import fileTable from "../../types/fileTable";
import getFileName from "../../../../utils/getFileName";
import fs from "fs-extra";

class KVPEngineJson {
    private currentJson = null
    private currentSrc: string = null
    private encryptionEngine

    /**
     * 初始化jsonStorage
     * @param src 若不存在，就建一个新的
     * @param pwd 密码
     */
    public init = (src: string, pwd: string, encryptionEngine) => {
        this.currentSrc = src
        this.encryptionEngine = encryptionEngine
        this.encryptionEngine.init(pwd)

        return new Promise<void>((resolve, reject) => {
            // 密码是无效字符串
            if (!pwd) {
                console.error("密码是无效字符串")
                console.log(pwd)
                reject(pwd)
            }
            if (fs.existsSync(src)) {
                this.currentJson = JSON.parse(fs.readFileSync(src, 'utf-8'))
                // 密码错误
                try {
                    this.getData(this.currentJson.meta.entryKey)
                } catch (e) {
                    console.error("密码错误", e)
                    console.log(pwd)
                    reject(pwd)
                }
                resolve()
            } else {
                this._createNewStore(src, getFileName(src)).then(() => { resolve() })
            }
        })
    }

    /**
     * 在内存中创建一个空的存储库
     * @param storageName
     * @param comment
     */
    public getEmptyJson = (storageName: string, comment: string = null) => {
        const dateNum: number = new Date().getTime()
        const hash = sharedUtils.getHash(32)
        const res = {
            meta: <storageLibMetaData>{
                modifiedTime: dateNum,
                createdTime: dateNum,
                accessedTime: dateNum,
                storageName,
                comment,
                entryKey: hash
            },
            data: {}
        }
        // 准备根目录filetable
        const fileTableData: fileTable = {
            selfKey: hash,
            items: []
        }
        res.data[hash] = this.encryptionEngine.encrypt(Buffer.from(JSON.stringify(fileTableData)))
        return res
    }

    /**
     * 将内存和本地数据同步
     */
    private sync = () => {
        fs.writeFileSync(this.currentSrc, JSON.stringify(this.currentJson))
    }

    /**
     * 在本地创建一个新的库
     * @param src
     * @param storageName
     * @param comment
     */
    private _createNewStore = (src: string, storageName: string, comment: string = null) => {
        this.currentJson = this.getEmptyJson(storageName, comment)
        this.currentSrc = src
        return new Promise<void>((resolve) => {
            this.sync()
            resolve()
        })
    }

    /**
     * 写入新数据
     * @param buf
     */
    private createNewData = (buf: Buffer) => {
        return new Promise<string>((resolve) => {
            const hash = <string>sharedUtils.getHash(32)
            this.currentJson.data[hash] = buf.toString()
            this.sync()
            resolve(hash)
        })
    }

    /**
     * 获取数据
     * @param hash
     */
    public getData = (hash: string): Buffer => {
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
    public setData = (hash: string, buf: Buffer) => {
        // if (buf.length === 0) { // 空字符串会被json解析的时候忽略
        //     return new Promise<void>((resolve) => {
        //         currentJson.data[hash] = encrypt(Buffer.from("no data"))
        //         sync()
        //         resolve()
        //     })
        // }
        return new Promise<void>((resolve) => {
            this.currentJson.data[hash] = this.encryptionEngine.encrypt(buf)
            this.sync()
            resolve()
        })
    }

    /**
     *
     * @param hash 根据已有键去set数据
     * @param buf
     */
    public deleteData = (hash: string) => {
        return new Promise<void>((resolve) => {
            delete this.currentJson.data[hash]
            this.sync()
            resolve()
        })
    }

    public getMeta = (): storageLibMetaData => {
        return this.currentJson.meta
    }

    public setMeta = (meta: storageLibMetaData) => {
        this.currentJson.meta = meta
    }
}

export default KVPEngineJson
