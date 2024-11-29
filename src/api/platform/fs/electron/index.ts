import fs from "fs-extra";
import notification from "@/api/notification";

const handleException = (e: any, shouldThrow = true) => {
    if (e.code === "ENOENT") {
        notification.error("[fs]文件不存在：" + e.message);
    } else if (e.code === "EACCES") {
        notification.error("[fs]没有权限操作文件，请以管理员身份运行：" + e.message);
    } else if (e.code === "EBUSY") {
        notification.error("[fs]文件正在使用，请稍后重试：" + e.message);
    } else {
        notification.error("[fs]操作文件失败：" + e.message);
    }
    if (shouldThrow) {
        throw e;
    }
};

const fsElectron: GcryptFS = {
    readFileSync: (path: string, options?: { encoding?: BufferEncoding | null; flag?: string }) => {
        try {
            return fs.readFileSync(path, options);
        } catch (e) {
            handleException(e);
        }
    },
    writeFileSync: (
        path: string,
        data: string | Buffer,
        options?: { encoding?: "utf8" | "ascii" | "binary" | "base64" | "hex" | null }
    ) => {
        try {
            return fs.writeFileSync(path, data, { encoding: options.encoding });
        } catch (e) {
            handleException(e);
        }
    },
    existsSync: (path: string) => {
        try {
            return fs.existsSync(path);
        } catch (e) {
            handleException(e);
        }
    },
    mkdirSync: (path: string, options?: { recursive?: boolean; mode?: number }) => {
        try {
            return fs.mkdirSync(path, options);
        } catch (e) {
            handleException(e);
        }
    },
    readFile: (path: string, options?: { encoding?: string; flag?: string }) => {
        return new Promise((resolve, reject) => {
            try {
                fs.readFile(path, options, (err, data) => {
                    if (err) {
                        handleException(err, false);
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    writeFile: (path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }) => {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFile(path, data, options, err => {
                    if (err) {
                        handleException(err, false);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    },
    mkdir: (path: string, options?: { recursive?: boolean; mode?: number }) => {
        return new Promise((resolve, reject) => {
            try {
                fs.mkdir(path, options, err => {
                    if (err) {
                        handleException(err, false);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }
};

export default fsElectron;
