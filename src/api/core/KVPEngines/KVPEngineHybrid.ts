/*
 * File: \src\api\core\KVPEngines\KVPEngineHybrid.ts
 * Project: Gcrypt
 * Created Date: 2024-02-14 20:27:48
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 20:27:49
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import fs from "fs-extra";
import getDigest from "@/api/hash/getDigest";
import KVPEngineFolder from "./KVPEngineFolder";
import calcBufSize from "@/utils/calcBufSize";
import ASSERT from "@/utils/ASSERT";

const calcDataFileSrc = (entryJsonSrc, dataFileName: string) => {
    let foo = entryJsonSrc.split("/")
    foo.pop()
    foo.push(dataFileName)
    return foo.join("/")
}

const config = {
    blockInclusionThreshold: 12 * 1024, // 小于这个值的value将被放在block内
    blockExclusionThreshold: 16 * 1024, // 大于这个值的value将被移出block
    blockSizeThreshold: 128 * 1024 // 尺寸大于这个值的block将不会被放入新的value
}

class KVPEngineHybrid extends KVPEngineFolder {
    // keyReferenceMap用于快速查询某个键是否在某个block内，若是，返回block名称
    private keyReferenceMap = null
    // blockUsageMap用于快速查询某个block的存在情况和空间使用情况
    private blockUsageMap = null

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public async init(storeEntryJsonSrc: string, pwd: string, encryptionEngine) {
        await super.init(storeEntryJsonSrc, pwd, encryptionEngine)
        this.keyReferenceMap = JSON.parse((await super.getData('@keyReferenceMap')).toString())
        this.blockUsageMap = JSON.parse((await super.getData('@blockUsageMap')).toString())
    }

    private async hasDataInBlock(blockKey: string, masterKey: string) {
        return Object.hasOwn(JSON.parse((await super.getData(blockKey)).toString()), masterKey)
    }

    private async getDataInBlock(blockKey: string, masterKey: string): Promise<Buffer | null> {
        const obj = JSON.parse((await super.getData(blockKey)).toString())
        if (!!obj && !!obj[masterKey]) {
            return Buffer.from(obj[masterKey])
        } else {
            return null
        }
    }

    private async setDataInBlock(blockKey: string, masterKey: string, value: Buffer): Promise<void> {
        const obj = JSON.parse((await super.getData(blockKey)).toString())
        if (obj) {
            // 修改对象，增加或改写键值对
            obj[masterKey] = value.toString()
            // 已修改的对象写回本地磁盘
            await super.setData(blockKey, Buffer.from(JSON.stringify(obj)))
            // 更新使用量数据
            if (!this.blockUsageMap[blockKey]) {
                this.blockUsageMap[blockKey] = 0
            }
            this.blockUsageMap[blockKey] += calcBufSize(value)
        } else {
            throw new Error("KVPEngineHybrid::setDataInBlock::noSuchKey: " + masterKey + "in block " + blockKey)
        }
    }

    private async deleteDataInBlock(blockKey: string, masterKey: string): Promise<void> {
        const obj = JSON.parse((await super.getData(blockKey)).toString())
        if (obj) {
            const size = calcBufSize(Buffer.from(obj[masterKey]))
            // 修改对象，删除键值对
            delete obj[masterKey]
            // 已修改的对象写回本地磁盘
            await super.setData(blockKey, Buffer.from(JSON.stringify(obj)))
            // 更新使用量数据
            ASSERT(this.blockUsageMap[blockKey] - size >= 0) // 断言：删除之后，block大小不应该为负数
            this.blockUsageMap[blockKey] -= size
        } else {
            throw new Error("KVPEngineHybrid::deleteDataInBlock::noSuchKey: " + masterKey + "in block " + blockKey)
        }
    }

    private getSuitableBlockKey():string {
        Object.keys(this.blockUsageMap).forEach((blockKey) => {
            
        })
    }

    /**
     * 判断数据是否存在
     * @param key
     */
    public async hasData(key: string): Promise<boolean> {
        if (this.keyReferenceMap[key]) {
            return true
        }
        return await super.hasData(key)
    }

    /**
     * 获取数据
     * @param key
     */
    public async getData(key: string): Promise<Buffer | null> {
        if (!(await this.hasData(key))) {
            return null
        }
        try {
            let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), 'md5'))
            await fs.access(dataFilePath)
            const data: Buffer = await fs.readFile(dataFilePath)
            return await this.encryptionEngine.decrypt(data)
        } catch (e) {
            console.error(`键值对引擎获取数据失败`, e)
            throw e
        }
    }

    /**
     *
     * @param key 根据已有键去set数据
     * @param buf
     */
    public async setData(key: string, buf: Buffer) {
        if (calcBufSize(buf) < config.blockInclusionThreshold) {

        } else {
            await super.setData(key, buf)
        }
    }

    /**
     *
     * @param key 根据已有键去set数据
     * @param buf
     */
    public async deleteData(key: string) {
        let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), 'md5'))
        await fs.unlink(dataFilePath)
    }
}

export default KVPEngineHybrid
