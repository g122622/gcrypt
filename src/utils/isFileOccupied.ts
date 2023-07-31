import { access, constants } from "fs-extra";

export default function isFileOccupied(file): Promise<boolean> {
    return new Promise((resolve) => {
        // Check if the file is writable.进而反映文件是否占用
        access(file, constants.W_OK, (err) => {
            resolve(Boolean(err))
        });
    })
}
