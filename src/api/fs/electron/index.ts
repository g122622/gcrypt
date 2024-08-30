import fs from "fs-extra";
import notification from "@/api/notification";

interface GcryptFS {
    readFileSync(path: string, options?: { encoding?: BufferEncoding | null; flag?: string }): Buffer | string;
    writeFileSync(path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }): void;
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean; mode?: number }): void;

    // async methods
    readFile(path: string, options?: { encoding?: string; flag?: string }): Promise<string | Buffer>;
    writeFile(path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean; mode?: number }): Promise<void>;
}

const handleException = (e: any) => {
    if (e.code === "ENOENT") {
        notification.error("[fs]文件不存在：" + e.message);
    } else if (e.code === "EACCES") {
        notification.error("[fs]没有权限操作文件，请以管理员身份运行：" + e.message);
    } else if (e.code === "EBUSY") {
        notification.error("[fs]文件正在使用，请稍后重试：" + e.message);
    } else {
        notification.error("[fs]操作文件失败：" + e.message);
    }
    throw e;
};

const fsElectron: GcryptFS = {
    readFileSync: (path: string, options?: { encoding?: BufferEncoding | null; flag?: string }) => {
        try {
            return fs.readFileSync(path, options);
        } catch (e) {
            handleException(e);
        }
    },
    writeFileSync: (path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }) => {
        try {
            return fs.writeFileSync(path, data, options);
        } catch (e) {
            handleException(e);
        }
    },
};

export default fsElectron;
