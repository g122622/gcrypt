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

import { fileTypesHashMap } from "@/types/fileTypes";

function getFileType(filename: string) {
    if (filename.indexOf(".") === -1) {
        return "unknown";
    }
    const extName = filename.split(".").pop();
    if (extName in fileTypesHashMap) {
        return fileTypesHashMap[extName];
    } else {
        return "unknown";
    }
}

export default getFileType;
