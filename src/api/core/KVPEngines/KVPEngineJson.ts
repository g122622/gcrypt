/**
 * File: \src\api\core\KVPEngines\KVPEngineJson.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 22:54:28
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import fs from "fs-extra";
import KVPEngineBase from "../types/KVPEngineBase";
import EncryptionEngineBase from "../types/EncryptionEngineBase";

const calcDataJsonSrc = (entryJsonSrc, dataJsonFileName: string) => {
    let foo = entryJsonSrc.split("/")
    foo.pop()
    foo.push(dataJsonFileName)
    return foo.join("/")
}

class KVPEngineJson implements KVPEngineBase {
    private currentJson = null
    private currentDataJsonSrc: string = null
    private encryptionEngine: EncryptionEngineBase

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public init = async (storeEntryJsonSrc: string, pwd: string, encryptionEngine) => {
        this.currentDataJsonSrc = calcDataJsonSrc(storeEntryJsonSrc, "data.json")
        this.encryptionEngine = encryptionEngine
        this.encryptionEngine.init(pwd)

        if (fs.existsSync(this.currentDataJsonSrc)) {
            this.currentJson = JSON.parse(await fs.readFile(this.currentDataJsonSrc, 'utf-8'))
        } else {
            await this.createNewStore()
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
     * 判断数据是否存在
     * @param hash
     */
    public hasData = async (hash: string): Promise<boolean> => {
        return Object.hasOwn(this.currentJson.data, hash)
    }

    /**
     * 获取数据
     * @param hash
     */
    public getData = async (hash: string): Promise<Buffer> => {
        // eslint-disable-next-line dot-notation
        if (Object['hasOwn'](this.currentJson.data, hash)) {
            const data: string = this.currentJson.data[hash]
            return await this.encryptionEngine.decrypt(Buffer.from(data, 'base64'))
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
        this.currentJson.data[hash] = (await this.encryptionEngine.encrypt(buf)).toString("base64")
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
