/* eslint-disable dot-notation */

import notification from "@/api/notification";

interface GcryptFS {
    readFileSync(path: string, options?: { encoding?: BufferEncoding | null; flag?: string }): Buffer | string;
    writeFileSync(
        path: string,
        data: string | Buffer,
        options?: { encoding?: "utf8" | "ascii" | "binary" | "base64" | "hex" | null }
    ): void;
    existsSync(path: string): boolean;
    mkdirSync(path: string, options?: { recursive?: boolean; mode?: number }): void;

    // async methods
    readFile(path: string, options?: { encoding?: string; flag?: string }): Promise<string | Buffer>;
    writeFile(path: string, data: string | Buffer, options?: { encoding?: string; mode?: number; flag?: string }): Promise<void>;
    mkdir(path: string, options?: { recursive?: boolean; mode?: number }): Promise<void>;
}

// 在浏览器中也能使用的虚拟fs模块，使用node的fs模块的接口来封装indexedDB的操作
// 初始化indexedDB，创建对象仓库，创建对象存储，创建索引

let db: IDBDatabase | null = null;

const initDB = () => {
    const request = window.indexedDB.open("gcrypt-virtual-fs", 1);

    request.onerror = event => {
        notification.error(
            `indexedDB 打开失败: ${request.error.name}, , ${event.target["errorCode"]}，请检查是否有权限/浏览器是否支持indexedDB`
        );
    };
    request.onsuccess = event => {
        db = event.target["result"];
    };
    request.onupgradeneeded = function (event) {
        let db = event.target["result"];
        db.createObjectStore("files", { keyPath: "id" });
    };

    db.onerror = event => {
        notification.error(`indexedDB 错误: ${request.error.name} , ${event.target["errorCode"]}`);
        console.error(request.error);
    };
};

initDB();

const fsBrowser: GcryptFS = {
    readFileSync: (path: string, options?: { encoding?: BufferEncoding | null; flag?: string }) => {
        const transaction = db.transaction(["files"], "readwrite");
        const objectStore = transaction.objectStore("files");
        objectStore.add(fileOrDirectoryObj);
    },
    writeFileSync: (
        path: string,
        data: string | Buffer,
        options?: { encoding?: "utf8" | "ascii" | "binary" | "base64" | "hex" | null }
    ) => {}
};

export default fsBrowser;
