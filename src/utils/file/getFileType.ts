/**
 * File: \src\utils\getFileType.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-16 15:30:22
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import fileTypes from "@/types/fileTypes";

function getFileType(filename: string) {
    if (filename.indexOf(".") === -1) {
        return "unknown"
    }
    const extName = filename.split(".").pop()

    const keys = Object.keys(fileTypes)
    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < fileTypes[keys[i]].length; j++) {
            if (fileTypes[keys[i]][j] === extName) {
                return keys[i]
            }
        }
    }
    return "unknown"
}

export default getFileType
