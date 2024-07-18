import fs from "fs-extra"
import path from "path"
import isFileOccupied from '@/utils/file/isFileOccupied'

interface Options {
    minUpdateIntervalMs: number,
    destroyIfNotOccupied: boolean
}

class FileWatcher {
    filePath: string
    options: Options
    oldFilename: string
    newFilename: string
    shouldRename = false
    shouldChange = false
    onRename
    onChange
    onDestroyed // 销毁回调，必须是同步函数
    private abortController: AbortController // watcher的中断控制器
    private interval

    constructor(filePath, options: Options) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`要watch的文件不存在: ${filePath}`)
        }
        this.filePath = filePath
        this.options = options
        this.newFilename = path.basename(filePath)

        this.initWatcher()
        this.initTimer()
    }

    private initWatcher() {
        this.abortController = new AbortController()
        fs.watch(this.filePath, { signal: this.abortController.signal }, async (eventType, filename) => {
            switch (eventType) {
                case "rename":
                    this.shouldRename = true
                    this.oldFilename = this.newFilename
                    this.newFilename = filename
                    break;
                case "change":
                    this.shouldChange = true
                    break;
            }
        })
    }

    private initTimer() {
        let intervalNum = 0
        this.interval = setInterval(async () => {
            // NOTE: 回调函数执行顺序有要求
            // 必须先执行onrename
            if (this.shouldRename) {
                await this.onRename(this.oldFilename, this.newFilename)
            }
            if (this.shouldChange) {
                await this.onChange(this.newFilename)
            }
            /**
             * NOTE:
             * 由于setInterval会立即运行一次回调函数
             * 为了避免外部程序反应不及时导致文件watcher一创建就被销毁
             */
            if (intervalNum >= 1 && this.options.destroyIfNotOccupied && !(await isFileOccupied(this.filePath))) {
                if (this.options.destroyIfNotOccupied) {
                    this.destroy()
                }
            }
            intervalNum++
        }, this.options.minUpdateIntervalMs ?? 30000)
    }

    /**
     * destroy 销毁实例
     */
    public destroy() {
        // 销毁定时器
        clearInterval(this.interval)
        // 中止文件监听
        this.abortController.abort()
        // call hook
        if (this.onDestroyed) {
            this.onDestroyed()
        }
    }
}

export default FileWatcher
