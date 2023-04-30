import fs from "fs-extra"
import path from "path"

interface Options {
    minUpdateIntervalMs: number
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

    constructor(filePath, options: Options) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`要watch的文件不存在:${filePath}`)
        }
        this.filePath = filePath
        this.options = options
        this.newFilename = path.basename(filePath)
        this.initWatcher()
        this.initTimer()
    }

    initWatcher() {
        fs.watch(this.filePath, async (eventType, filename) => {
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

    initTimer() {
        // TODO 销毁定时器
        setInterval(() => {
            // NOTE: 回调函数执行顺序有要求
            // 必须先执行onrename
            if (this.shouldRename) {
                this.onRename(this.oldFilename, this.newFilename)
            }
            if (this.shouldChange) {
                this.onChange(this.newFilename)
            }
        }, this.options.minUpdateIntervalMs)
    }
}
