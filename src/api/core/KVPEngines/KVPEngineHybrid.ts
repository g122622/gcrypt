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

import KVPEngineFolder from "./KVPEngineFolder";
import calcBufSize from "@/utils/calcBufSize";
import ASSERT from "@/utils/ASSERT";
import sharedUtils from "@/utils/sharedUtils";
import Lock from "@/utils/helpers/Lock"

const config = {
    blockInclusionThreshold: 12 * 1024, // 小于这个值的value将被放在block内
    blockExclusionThreshold: 16 * 1024, // 大于这个值的value将被移出block
    blockSizeThreshold: 128 * 1024 // 尺寸大于这个值的block将不会被放入新的value
}

class KVPEngineHybrid extends KVPEngineFolder {
    // keyReferenceMap用于快速查询某个键是否在某个block内，若是，返回block名称
    private keyReferenceMap = {}
    // blockUsageMap用于快速查询某个block的存在情况和空间使用情况
    private blockUsageMap = {}
    // 用于确保操作的原子性
    private opLock: Lock

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public async init(storeEntryJsonSrc: string, pwd: string, encryptionEngine) {
        this.opLock = new Lock()
        await super.init(storeEntryJsonSrc, pwd, encryptionEngine)
        if (await super.hasData('@keyReferenceMap')) {
            this.keyReferenceMap = JSON.parse((await super.getData('@keyReferenceMap')).toString())
        }
        if (await super.hasData('@blockUsageMap')) {
            this.blockUsageMap = JSON.parse((await super.getData('@blockUsageMap')).toString())
        }
    }

    private async saveMaps() {
        await super.setData('@keyReferenceMap', Buffer.from(JSON.stringify(this.keyReferenceMap)))
        await super.setData('@blockUsageMap', Buffer.from(JSON.stringify(this.blockUsageMap)))
    }

    private async hasDataInBlock(blockKey: string, masterKey: string) {
        // TS2339: Property 'hasOwn' does not exist on type 'ObjectConstructor'.
        // eslint-disable-next-line dot-notation
        return Object['hasOwn'](JSON.parse((await super.getData(blockKey)).toString()), masterKey)
    }

    private async getDataInBlock(blockKey: string, masterKey: string): Promise<Buffer | null> {
        // console.log(blockKey, masterKey, (await super.getData(blockKey)).toString())
        const obj = JSON.parse((await super.getData(blockKey)).toString())
        if (!!obj && !!obj[masterKey]) {
            return Buffer.from(obj[masterKey], 'binary')
        } else {
            // 还需判断obj[masterKey]是否为空字符串
            if (obj[masterKey] === '') {
                return Buffer.from('')
            }
            return null
        }
    }

    /**
     *
     * @param blockKey Note：如果存储库没有指定的blockKey，那么就静默地新建一个，不会修改其他map
     * @param masterKey
     * @param value
     */
    private async setDataInBlock(blockKey: string, masterKey: string, value: Buffer): Promise<void> {
        let obj = null
        if (await super.hasData(blockKey)) {
            obj = JSON.parse((await super.getData(blockKey)).toString())
        } else {
            obj = {}
        }

        // 修改对象，增加或改写键值对
        obj[masterKey] = value.toString('binary')
        // 已修改的对象写回本地磁盘
        await super.setData(blockKey, Buffer.from(JSON.stringify(obj)))
        // 更新使用量数据
        if (!this.blockUsageMap[blockKey]) {
            this.blockUsageMap[blockKey] = 0
        }
        this.blockUsageMap[blockKey] += calcBufSize(value)
        // 更新keyReferenceMap
        this.keyReferenceMap[masterKey] = blockKey
        await this.saveMaps()
    }

    private async deleteDataInBlock(blockKey: string, masterKey: string): Promise<void> {
        const obj = JSON.parse((await super.getData(blockKey)).toString())
        if (obj) {
            const size = calcBufSize(Buffer.from(obj[masterKey], 'binary'))
            // 修改对象，删除键值对
            delete obj[masterKey]
            // 已修改的对象写回本地磁盘
            await super.setData(blockKey, Buffer.from(JSON.stringify(obj)))
            // 更新使用量数据
            ASSERT(this.blockUsageMap[blockKey] - size >= 0) // 断言：删除之后，block大小不应该为负数
            this.blockUsageMap[blockKey] -= size
            // 更新keyReferenceMap
            delete this.keyReferenceMap[masterKey]
            await this.saveMaps()
        } else {
            throw new Error("KVPEngineHybrid::deleteDataInBlock::noSuchKey: " + masterKey + "in block " + blockKey)
        }
    }

    private getSuitableBlockKey(): string {
        const blockKeys = Object.keys(this.blockUsageMap)
        for (let i = 0; i < blockKeys.length; i++) {
            if (this.blockUsageMap[blockKeys[i]] <= config.blockSizeThreshold) {
                return blockKeys[i]
            }
        }
        // 运行到这里，说明没有找到合适的blockKey，那么创建新的blockKey
        const newBlockKey = sharedUtils.getHash()
        this.blockUsageMap[newBlockKey] = 0
        return newBlockKey
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
        await this.opLock.lock()
        if (!(await this.hasData(key))) {
            this.opLock.unlock()
            return null
        }
        // 若属于存在block内的小文件
        if (this.keyReferenceMap[key]) {
            const res = await this.getDataInBlock(this.keyReferenceMap[key], key)
            this.opLock.unlock()
            return res
        } else {
            const res = await super.getData(key)
            this.opLock.unlock()
            return res
        }
    }

    /**
     *
     * @param key 根据已有键去set数据
     * @param buf
     */
    public async setData(key: string, buf: Buffer) {
        await this.opLock.lock()

        // 小文件，从单独存放转移，再存block
        if (calcBufSize(buf) <= config.blockInclusionThreshold) {
            if (this.keyReferenceMap[key]) {
                // 本来就在block内，无需转移
                await this.setDataInBlock(this.keyReferenceMap[key], key, buf)
            } else {
                // 检测到不在block内（或者是新写入的文件），需要从单独存放转移至block内
                if (await super.hasData(key)) {
                    await super.deleteData(key)
                }
                await this.setDataInBlock(this.getSuitableBlockKey(), key, buf)
            }
        } else if (calcBufSize(buf) > config.blockInclusionThreshold && calcBufSize(buf) < config.blockInclusionThreshold) {
            // 介于大小之间的文件，需要维持原来的状态
            if (this.keyReferenceMap[key]) {
                // 检测到在block内
                await this.setDataInBlock(this.keyReferenceMap[key], key, buf)
            } else {
                await super.setData(key, buf)
            }
        } else { // 大文件，移出block之后单独存放
            if (this.keyReferenceMap[key]) {
                // 检测到一定在block内（不可能是新写入的文件），需要转移至单独存放
                await this.deleteDataInBlock(this.keyReferenceMap[key], key)
                await super.setData(key, buf)
            } else {
                // 本来就是单独存放，无需转移
                await super.setData(key, buf)
            }
        }

        this.opLock.unlock()
    }

    /**
     *
     * @param key 根据已有键去delete数据
     * @param buf
     */
    public async deleteData(key: string) {
        await this.opLock.lock()
        if (this.keyReferenceMap[key]) {
            await this.deleteDataInBlock(this.keyReferenceMap[key], key)
        } else {
            await super.deleteData(key)
        }
        this.opLock.unlock()
    }
}

export default KVPEngineHybrid
