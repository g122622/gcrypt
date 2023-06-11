import os from "os";
import path from "path";
import fs from "fs-extra";
import getExtName from "@/utils/getExtName";
import sharedUtils from "@/utils/sharedUtils";
import FileWatcher from "./FileWatcher";
import AdapterBase from "./core/types/AdapterBase";

import { useSettingsStore } from "@/store/settings"
import { useMainStore } from "@/store/main"
const settingsStore = useSettingsStore()
const mainStore = useMainStore()

class File {
    private data
    private adapter: AdapterBase
    private fileWatcher: FileWatcher = null
    public filename: string
    private fileguid: string
    public type: number

    constructor(fileguid) {
        mainStore.setFileActiveState(fileguid, 'file', this)
    }

    public fromData(arg) {
        this.data = arg
        this.type = 0
    }

    public fromAdapter(adapter: AdapterBase, filename: string) {
        this.adapter = adapter
        this.filename = filename
        this.type = 1
        if (this.fileguid) {
            mainStore.setFileActiveState(this.fileguid, 'isOpen', true)
        }
    }

    /**
     * 将文件对象转为基于临时文件的文件对象，并返回临时文件的地址
     */
    public async toTempFile() {
        // 创建临时文件
        const tmpdir = path.join(
            os.tmpdir(),
            sharedUtils.getHash(16) + '.' + getExtName(this.filename))
        await fs.writeFile(tmpdir, await this.read())

        // 创建filewatcher，监听临时文件修改
        this.fileWatcher = new FileWatcher(tmpdir, {
            minUpdateIntervalMs: Number(settingsStore.getSetting('tmp_file_sync_interval')),
            destroyIfNotOccupied: true
        })
        this.fileWatcher.onChange = async () => {
            const newTmpFile = await fs.readFile(tmpdir)
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

        return tmpdir
    }

    public async read() {
        switch (this.type) {
            case 0:
                return this.data

            case 1:
                return await this.adapter.readFile(this.filename)
        }
    }

    public async write(arg) {
        // TODO 节流
        switch (this.type) {
            case 0:
                this.data = arg
                break

            case 1:
                return await this.adapter.writeFile(this.filename, arg)
        }
    }

    public destroy() {
        if (this.fileWatcher) {
            this.fileWatcher.destroy()
        }
    }

    /**
     * 静态方法
     */
    static inactivateFile(fileguid) {
        mainStore.activeFiles.get(fileguid).file.destroy()
        mainStore.activeFiles.delete(fileguid)
    }
}

export default File
