/**
 * File: \src\utils\getExtName.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-21 20:57:25
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

function getExtName(arg: string) {
    if (!arg) return arg
    const tokens = arg.split(".")
    if (tokens.length <= 1) {
        return ""
    } else {
        return tokens.pop()
    }
}

export default getExtName
