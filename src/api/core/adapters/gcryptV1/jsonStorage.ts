/* eslint-disable node/no-deprecated-api */
import sharedUtils from "../../../../utils/sharedUtils"
import storageLibMetaData from "../../types/storageLibMetaData"
import fileTable from "../../types/fileTable";
import getFileName from "../../../../utils/getFileName";
import fs from "fs-extra";
/* eslint-disable @typescript-eslint/no-var-requires */
const crypto = require("crypto")

const EncryptConfig = {
    algorithm: 'aes-192-cbc',
    outputStringEncoding: 'base64'
}

let currentJson = null
let currentSrc: string = null
let currentPwd: string = null

const encrypt = function (rawData: Buffer): string {
    if (!currentPwd) {
        console.error("currentPwd无效", currentPwd)
        return
    }
    let ciper = crypto.createCipher(EncryptConfig.algorithm, currentPwd);
    let res = ciper.update(rawData, 'buffer', EncryptConfig.outputStringEncoding);
    res += ciper.final(EncryptConfig.outputStringEncoding);
    return res;
}

const decrypt = function (rawStringData: string): Buffer {
    if (!currentPwd) {
        console.error("currentPwd无效", currentPwd)
        return
    }
    let deciper = crypto.createDecipher(EncryptConfig.algorithm, currentPwd);
    let res = deciper.update(rawStringData, EncryptConfig.outputStringEncoding, "buffer");
    res += deciper.final("buffer");
    return res;
}

const getEmptyJson = (storageName: string, comment: string = null) => {
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
    res.data[hash] = encrypt(Buffer.from(JSON.stringify(fileTableData)))
    return res
}

const init = (src: string, pwd: string) => {
    currentSrc = src
    currentPwd = pwd
    return new Promise<void>((resolve, reject) => {
        // 密码是无效字符串
        if (!pwd) {
            console.error("密码是无效字符串")
            console.log(pwd)
            reject(pwd)
        }
        if (fs.existsSync(src)) {
            currentJson = JSON.parse(fs.readFileSync(src, 'utf-8'))
            // 密码错误
            try {
                getData(currentJson.meta.entryKey)
            } catch (e) {
                console.error("密码错误", e)
                console.log(pwd)
                reject(pwd)
            }
            resolve()
        } else {
            _createNewStore(src, getFileName(src)).then(() => { resolve() })
        }
    })
}

const sync = () => {
    fs.writeFileSync(currentSrc, JSON.stringify(currentJson))
}

const _createNewStore = (src: string, storageName: string, comment: string = null) => {
    currentJson = getEmptyJson(storageName, comment)
    currentSrc = src
    return new Promise<void>((resolve) => {
        sync()
        resolve()
    })
}

const createNewData = (buf: Buffer) => {
    return new Promise<string>((resolve) => {
        const hash = <string>sharedUtils.getHash(32)
        currentJson.data[hash] = buf.toString()
        sync()
        resolve(hash)
    })
}

const getData = (hash: string): Buffer => {
    const data: string = currentJson.data[hash]
    if (!data) {
        console.error(`这个哈希key不存在`, hash, currentJson)
    } else {
        return decrypt(data)
    }
}

const setData = (hash: string, buf: Buffer) => {
    // if (buf.length === 0) { // 空字符串会被json解析的时候忽略
    //     return new Promise<void>((resolve) => {
    //         currentJson.data[hash] = encrypt(Buffer.from("no data"))
    //         sync()
    //         resolve()
    //     })
    // }
    return new Promise<void>((resolve) => {
        currentJson.data[hash] = encrypt(buf)
        sync()
        resolve()
    })
}

const getMeta = (): storageLibMetaData => {
    return currentJson.meta
}

const setMeta = (meta: storageLibMetaData) => {
    currentJson.meta = meta
}

export { init, createNewData, getData, getMeta, setMeta, setData }
