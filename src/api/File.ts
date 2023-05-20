import os from "os";
import path from "path";
import fs from "fs-extra";
import getExtName from "@/utils/getExtName";
import sharedUtils from "@/utils/sharedUtils";
import FileWatcher from "./FileWatcher";
import AdapterBase from "./core/types/AdapterBase";

class File {
    private data
    private adapter: AdapterBase
    private filename: string
    private type: number

    public fromData(arg) {
        this.data = arg
        this.type = 0
    }

    public fromAdapter(adpt: AdapterBase, fn: string) {
        this.adapter = adpt
        this.filename = fn
        this.type = 1
    }

    public async toTempFile() {
        // 创建临时文件
        const tmpdir = path.join(
            os.tmpdir(),
            sharedUtils.getHash(16) + '.' + getExtName(this.filename))
        await fs.writeFile(tmpdir, this.read())

        // 创建filewatcher，监听临时文件修改
        const fw = new FileWatcher(tmpdir, { minUpdateIntervalMs: 30000 })
        const callback = async () => {
            const newTmpFile = await fs.readFile(tmpdir)
            this.write(newTmpFile)
        }
        fw.onChange(callback)

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
}

export default File
