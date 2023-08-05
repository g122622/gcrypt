import ASSERT from "@/utils/ASSERT"
import { error } from "@/utils/gyConsole"
import crypto from "crypto"
import EncryptionEngineBase from "../types/EncryptionEngineBase"

const EncryptConfig = {
    algorithm: 'aes-192-cbc',
    iv: new Uint8Array([86, 215, 125, 103, 83, 172, 176, 47, 18, 209, 131, 206, 48, 61, 70, 196])
}

class EncryptionEngineAES192 extends EncryptionEngineBase {
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
            ASSERT(!!this.currentPwd)
            try {
                crypto.scrypt(this.currentPwd, 'gcrypt', 24, (err, key) => {
                    if (err) throw err;

                    const cipher = crypto.createCipheriv(EncryptConfig.algorithm, key, EncryptConfig.iv);
                    let encrypted = '';
                    cipher.setEncoding('binary');
                    cipher.on('data', (chunk) => {
                        encrypted += chunk
                    });
                    cipher.on('end', () => { resolve(Buffer.from(encrypted, 'binary')) });
                    cipher.write(rawData);
                    cipher.end();
                });
            } catch (e) {
                error("加密失败" + e.toString())
                throw e
            }
        })
    }

    /**
     * 解密数据
     * @param rawBufData 被加密的原始数据
     */
    public decrypt = function (rawBufData: Buffer): Promise<Buffer> {
        ASSERT(!!this.currentPwd)
        return new Promise((resolve) => {
            ASSERT(!!this.currentPwd)
            try {
                crypto.scrypt(this.currentPwd, 'gcrypt', 24, (err, key) => {
                    if (err) throw err;

                    const decipher = crypto.createDecipheriv(EncryptConfig.algorithm, key, EncryptConfig.iv);
                    let decrypted = Buffer.from('');
                    decipher.on('readable', () => {
                        let chunk;
                        while ((chunk = decipher.read()) !== null) {
                            decrypted = Buffer.concat([decrypted, chunk])
                        }
                    });
                    decipher.on('end', () => {
                        resolve(decrypted)
                    });
                    decipher.write(rawBufData, 'binary');
                    decipher.end();
                });
            } catch (e) {
                error("加密失败" + e.toString())
                throw e
            }
        })
    }
}

export default EncryptionEngineAES192
