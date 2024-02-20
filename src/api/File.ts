/* eslint-disable dot-notation */
import os from "os";
import path from "path";
import fs from "fs-extra";
import getExtName from "@/utils/file/getExtName";
import sharedUtils from "@/utils/sharedUtils";
import FileWatcher from "./FileWatcher";
import AdapterBase from "./core/types/AdapterBase";
import { useSettingsStore } from "@/store/settings"
import { useMainStore } from "@/store/main"
import emitter from "@/eventBus";
import Addr from "./core/common/Addr";
import { useTaskStore } from '@/store/task'
import Task from "./Task";

let taskStore = null
let settingsStore = null
let mainStore = null

enum FileType {
    RawData,
    Adapter,
    Ref
}

// 初始化过早会导致找不到活跃pinia实例
emitter.on('LifeCycle::finishedLoadingApp', () => {
    settingsStore = useSettingsStore(window['pinia'])
    mainStore = useMainStore(window['pinia'])
    taskStore = useTaskStore(window['pinia'])
})

class File {
    private data
    private adapter: AdapterBase
    private fileWatcher: FileWatcher = null
    public filename: string
    private fileguid: string
    private fileType: FileType
    private AdapterCWD: Addr
    private tmpFilePath: string

    constructor(fileguid = sharedUtils.getHash(16)) {
        this.fileguid = fileguid
        mainStore.setFileActiveState(fileguid, 'file', this)
    }

    public fromRawData(arg) {
        this.data = arg
        this.fileType = FileType.RawData
    }

    public fromRef(arg) {
        this.data = arg
        this.fileType = FileType.Ref
    }

    public async fromAdapter(adapter: AdapterBase, filename: string) {
        this.adapter = adapter
        this.filename = filename
        this.fileType = FileType.Adapter
        this.AdapterCWD = adapter.getCurrentDirectory()
        if (this.fileguid) {
            mainStore.setFileActiveState(this.fileguid, 'isOpen', true)
        }
    }

    /**
     * 将文件对象转为基于临时文件的文件对象，并返回临时文件的地址
     */
    public async toTempFile() {
        // 不得重复操作
        if (this.tmpFilePath) {
            return;
        }
        // 创建临时文件
        this.tmpFilePath = path.join(
            os.tmpdir(),
            sharedUtils.getHash(16) + '.' + getExtName(this.filename))
        await fs.writeFile(this.tmpFilePath, await this.read())

        // 创建filewatcher，监听临时文件修改
        this.fileWatcher = new FileWatcher(this.tmpFilePath, {
            minUpdateIntervalMs: Number(settingsStore.getSetting('tmp_file_sync_interval')),
            destroyIfNotOccupied: false
        })
        this.fileWatcher.onChange = async () => {
            const newTmpFile = await fs.readFile(this.tmpFilePath)
            await this.write(newTmpFile)
        }
        this.fileWatcher.onDestroyed = () => {
            // 修改文件状态
            if (this.fileguid) {
                mainStore.setFileActiveState(this.fileguid, 'isUsingTempFile', false)
            }
        }

        // 修改文件状态
        if (this.fileguid) {
            mainStore.setFileActiveState(this.fileguid, 'isUsingTempFile', true)
        }

        return this.tmpFilePath
    }

    public async read() {
        switch (this.fileType) {
            case FileType.RawData:
                return this.data

            case FileType.Adapter:
                return await this.adapter.readFile(this.filename, this.AdapterCWD)

            case FileType.Ref:
                return this.data.value
        }
    }

    /**
     * 写入文件
     * @param arg 在adapter模式下会自动转为buffer
     */
    public async write(arg) {
        switch (this.fileType) {
            case FileType.RawData:
                this.data = arg
                break

            case FileType.Adapter:
                return await this.adapter.writeFile(this.filename, Buffer.from(arg), this.AdapterCWD)

            case FileType.Ref:
                this.data.value = arg
                break
        }
    }

    /**
     * 导出文件到外部
     * @param path 不包含文件名称！
     */
    public async exportToExt(folderPath: string) {
        const destPath = path.join(folderPath, this.filename ?? sharedUtils.getHash(7))
        taskStore.addTask(new Task(async () => {
            await fs.writeFile(destPath, await this.read())
        }, { name: `导出文件 ${destPath}` }), { runImmediately: true })
    }

    public async destroy() {
        // 先销毁文件watcher，再删除临时文件，
        // 若顺序颠倒则会在删除的时候触动fileWatcher
        if (this.fileWatcher) {
            this.fileWatcher.destroy()
        }
        if (this.tmpFilePath) {
            await fs.unlink(this.tmpFilePath)
        }
    }

    /**
     * 静态方法
     */
    static async inactivateFile(fileguid) {
        await mainStore.activeFiles.get(fileguid).file.destroy()
        mainStore.activeFiles.delete(fileguid)
    }
}

export default File
