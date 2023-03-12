import { error } from "@/utils/gyConsole";
import sharedUtils from "@/utils/sharedUtils";
import Addr from "../../common/Addr";
import dirSingleItem from "../../types/dirSingleItem";
import fileTable from "../../types/fileTable";
import storageLibMetaData from "../../types/storageLibMetaData";
import { init, getMeta, getData, setData } from "./jsonStorage";
import lodash from "lodash";

/** tips
 * 1.inner methods are set the prefix "_"
 * 2.
 */

let currentDirectory: Addr
let currentFileTable: fileTable
const cachedFileTables: Array<{ fileTable: fileTable, dir: Addr }> = []

/**
 * 初始化adapter，若不存在，则根据传入的src的末尾文件名解析出storeName
 * @param storageSrc example:C:/gy/store.json
 * @param pwd
 */
const initAdapter = function (storageSrc, pwd) {
    return new Promise<storageLibMetaData>((resolve, reject) => {
        init(storageSrc, pwd).then(() => {
            currentDirectory = new Addr("")
            currentFileTable = _getFileTable(currentDirectory)
            resolve(getMeta())
        })
    })
}

/**
 * 改变当前工作目录
 * @param newDir 新的工作目录
 */
const changeCurrentDirectory = function (newDir: Addr): void {
    // 没有改变，再见
    if (currentDirectory.compareWith(newDir)) {
        return
    }
    // 改变当前工作目录
    currentDirectory = lodash.cloneDeep(newDir)
    // 更新文件列表
    currentFileTable = _getFileTable(newDir)
    _updateCache()
}

/**
 * 缓存文件列表，提高下次访问速率
 */
const _cacheFileTables = function (fileTable: fileTable, dir: Addr) {
    for (let i = 0; i < cachedFileTables.length; i++) {
        // 发现之前缓存过一样的dir，那么更新缓存
        if (cachedFileTables[i].dir.compareWith(dir)) {
            cachedFileTables[i] = lodash.cloneDeep({ fileTable, dir })
            return
        }
    }
    cachedFileTables.push(lodash.cloneDeep({ fileTable, dir }))
}

/**
 * 根据currentFileTable更新cache，在更改了currentFileTable时必须调用
 */
const _updateCache = function (): void {
    _cacheFileTables(currentFileTable, currentDirectory)
}

/**
 * 根据传入的dir递归遍历文件系统，将找到的filetable传回
 * TODO query的时候尽量获取缓存内容，而不是一直递归到根目录
 */
const _getFileTable = function (dir: Addr): fileTable {
    const foo = lodash.cloneDeep(dir)

    // 先查找缓存，看是否命中
    for (let i = 0; i < cachedFileTables.length; i++) {
        if (cachedFileTables[i].dir.compareWith(foo)) {
            // console.log("cache hitted!", newDir, cachedFileTables[i].fileTable)
            return cachedFileTables[i].fileTable
        }
    }

    // 缓存未命中
    if (foo.isRoot()) {
        const entryKey: string = getMeta().entryKey
        const tempTable: fileTable = <fileTable>JSON.parse(getData(entryKey).toString())
        _cacheFileTables(tempTable, foo)
        return tempTable
    } else {
        foo.up()
        // 查找符合上一层dir的子文件列表，将其应用在本层dir
        const tempTable: fileTable = JSON.parse(readFile(dir.getTopToken(), _getFileTable(foo)).toString())
        _cacheFileTables(tempTable, dir)
        return tempTable
    }
}

/**
 * 读取文件
 * @param filename the name of the file to read
 * @param fileTable optional:if provided,this function will search the file in the given file table instead of the currentFileTable
 */
const readFile = function (filename, fileTable = null): Buffer {
    if (!filename) {
        error("地址无效")
        return
    }
    // 拿到key
    let matches: Array<dirSingleItem>
    if (fileTable === null) {
        matches = currentFileTable.items.filter(item => item.name === filename)
    } else {
        matches = fileTable.items.filter(item => item.name === filename)
    }
    let key: string = null
    if (matches.length === 0) {
        error("文件不存在")
        throw new Error("")
    }
    key = matches[0].key
    // 取数据
    return getData(key)
}

/**
 * 写入数据
 * @param filename 文件名
 * @param data buffer数据
 */
const writeFile = async function (filename: string, data: Buffer): Promise<void> {
    if (exists(filename)) {
        // [内存]当前文件表修改dirSingleItem，并更新缓存
        const dateNum: number = new Date().getTime()
        const foo: dirSingleItem = currentFileTable.items.find(item => item.name === filename)
        foo.meta.modifiedTime = dateNum
        currentFileTable.items.push(foo)
        _updateCache()
        // [本地]1.保存更新后的文件列表到本地
        await setData(currentFileTable.selfKey, Buffer.from(JSON.stringify(currentFileTable)))

        // [本地]2.创建文件数据到本地
        await setData(foo.key, data)
    } else {
        // [内存]当前文件表增加一个dirSingleItem，并更新缓存
        const dateNum: number = new Date().getTime()
        const hash = sharedUtils.getHash(32)
        const foo: dirSingleItem = {
            name: filename,
            type: "file",
            meta: {
                modifiedTime: dateNum,
                createdTime: dateNum,
                accessedTime: dateNum,
            },
            key: hash
        }

        currentFileTable.items.push(foo)
        _updateCache()
        // [本地]1.保存更新后的文件列表到本地
        await setData(currentFileTable.selfKey, Buffer.from(JSON.stringify(currentFileTable)))

        // [本地]2.创建文件数据到本地
        await setData(hash, data)
    }
}

/**
 * 当前工作目录是否存在给定文件名
 * @param filename 文件名
 */
const exists = function (filename: string): boolean {
    const matches = currentFileTable.items.filter(item => item.name === filename)
    if (matches.length === 0) {
        return false
    } else {
        return true
    }
}

/**
 * 创建文件夹
 * @param folderName 文件夹名
 */
const mkdir = async function (folderName: string): Promise<void> {
    // if names conflict
    if (exists(folderName)) {
        console.error("文件夹已存在");
        return
    }
    // [内存]当前文件表增加一个dirSingleItem，并更新缓存
    const dateNum: number = new Date().getTime()
    const hash = sharedUtils.getHash(32)
    const foo: dirSingleItem = {
        name: folderName,
        type: "folder",
        meta: {
            modifiedTime: dateNum,
            createdTime: dateNum,
            accessedTime: dateNum,
        },
        key: hash
    }

    currentFileTable.items.push(foo)
    _updateCache()
    // [本地]1.保存更新后的文件列表到本地
    await setData(currentFileTable.selfKey, Buffer.from(JSON.stringify(currentFileTable)))

    // [本地]2.创建新的文件列表到本地
    const fileTableData: fileTable = {
        selfKey: hash,
        items: []
    }
    await setData(hash, Buffer.from(JSON.stringify(fileTableData)))
}

const deleteFile = (filename) => {
    if (!exists(filename)) {
        error(`文件不存在，无法删除 ${filename}`)
    }
}

/**
 * 获取当前文件列表
 */
const getCurrentFileTable = function (): fileTable {
    return currentFileTable
}

export default { mkdir, changeCurrentDirectory, readFile, initAdapter, getCurrentFileTable, writeFile }
