/**
 * File: \src\api\core\encryptionEngines\EncryptionEngineNoop.ts
 * Project: Gcrypt
 * Created Date: 2024-02-15 16:53:24
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-16 15:40:03
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 * 不进行任何加密操作的EncryptionEngineNoop，仅供调试使用
 * ------------------------------------
 */

import EncryptionEngineBase from "../types/EncryptionEngineBase"

class EncryptionEngineNoop implements EncryptionEngineBase {
    private currentPwd: string = null

    public init(pwd) {
        this.currentPwd = pwd
    }

    /**
     * 加密数据
     * @param rawData
     */
    public encrypt = function (rawData: Buffer): Promise<Buffer> {
        return new Promise((resolve) => {
            // console.log('收到加密任务', rawData.toString())
            resolve(rawData)
        })
    }

    /**
     * 解密数据
     * @param rawBufData 被加密的原始数据
     */
    public decrypt = function (rawBufData: Buffer): Promise<Buffer> {
        return new Promise((resolve) => {
            resolve(rawBufData)
        })
    }
}

export default EncryptionEngineNoop
