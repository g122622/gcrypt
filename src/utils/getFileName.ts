/**
 * File: \src\utils\getFileName.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-21 20:57:32
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

function getFileName(src: string, withExt = false) {
    if (withExt) {
        return src.replaceAll("\\", "/").split("/").pop()
    }
    return src.replaceAll("\\", "/").split("/").pop().split(".")[0]
}

export default getFileName
