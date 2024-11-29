/**
 * File: \src\api\core\KVPEngines\KVPEngineFolder.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-15 10:57:42
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import fs from "fs-extra";
import KVPEngineBase from "../types/KVPEngineBase";
import EncryptionEngineBase from "../types/EncryptionEngineBase";
import getDigest from "@/api/hash/getDigest";

const calcDataFileSrc = (entryJsonSrc, dataFileName: string) => {
    let foo = entryJsonSrc.split("/");
    foo.pop();
    foo.push(dataFileName);
    return foo.join("/");
};

class KVPEngineFolder implements KVPEngineBase {
    private encryptionEngine: EncryptionEngineBase;
    private storeEntryJsonSrc;

    /**
     * 初始化jsonStorage
     * @param storeEntryJsonSrc 入口json文件的绝对路径，不是data.json的路径！！！
     * @param pwd 密码
     */
    public async init(storeEntryJsonSrc: string, encryptionEngine) {
        this.storeEntryJsonSrc = storeEntryJsonSrc;
        this.encryptionEngine = encryptionEngine;
    }

    /**
     * 判断数据是否存在
     * @param key
     */
    public async hasData(key: string): Promise<boolean> {
        try {
            await fs.access(calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), "md5")));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 获取数据
     * @param key
     */
    public async getData(key: string): Promise<Buffer | null> {
        if (!(await this.hasData(key))) {
            return null;
        }
        try {
            let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), "md5"));
            await fs.access(dataFilePath);
            const data: Buffer = await fs.readFile(dataFilePath);
            return await this.encryptionEngine.decrypt(data);
        } catch (e) {
            console.error(`键值对引擎获取数据失败`, e);
            throw e;
        }
    }

    /**
     *
     * @param key 根据已有键去set数据
     * @param buf
     */
    public async setData(key: string, buf: Buffer) {
        let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), "md5"));
        await fs.writeFile(dataFilePath, await this.encryptionEngine.encrypt(buf));
    }

    /**
     *
     * @param key 根据已有键去delete数据
     * @param buf
     */
    public async deleteData(key: string) {
        let dataFilePath = calcDataFileSrc(this.storeEntryJsonSrc, getDigest(Buffer.from(key), "md5"));
        await fs.unlink(dataFilePath);
    }
}

export default KVPEngineFolder;
