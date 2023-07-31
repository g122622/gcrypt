/* eslint-disable node/no-deprecated-api */
/* eslint-disable @typescript-eslint/no-var-requires */
import { error } from "@/utils/gyConsole"
const crypto = require("crypto")

const EncryptConfig = {
    algorithm: 'aes-192-cbc',
    outputStringEncoding: 'base64'
}

class EncryptionEngineAES192 {
    private currentPwd: string = null

    public init(pwd) {
        this.currentPwd = pwd
    }

    /**
     * 加密数据
     * @param rawData
     */
    public encrypt = function (rawData: Buffer): string {
        if (!this.currentPwd) {
            console.error("currentPwd无效", this.currentPwd)
            throw new TypeError()
        }
        try {
            const ciper = crypto.createCipher(EncryptConfig.algorithm, this.currentPwd);
            let res = ciper.update(rawData, 'buffer', EncryptConfig.outputStringEncoding);
            res += ciper.final(EncryptConfig.outputStringEncoding);
            return res;
        } catch (e) {
            error("加密失败" + e.toString())
            throw e
        }
    }

    /**
     * 解密数据
     * @param rawStringData 被加密的原始数据
     */
    public decrypt = function (rawStringData: string): Buffer {
        if (!this.currentPwd) {
            error("currentPwd无效: " + this.currentPwd)
            throw new TypeError()
        }
        try {
            const deciper = crypto.createDecipher(EncryptConfig.algorithm, this.currentPwd);
            let res = deciper.update(rawStringData, EncryptConfig.outputStringEncoding, "buffer");
            res = Buffer.concat([res, deciper.final("buffer")])
            return res;
        } catch (e) {
            error("解密失败 " + e.toString())
            throw e
        }
    }
}

export default EncryptionEngineAES192
