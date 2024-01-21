/**
 * File: \src\utils\image\getThumbnailFromSystem.ts
 * Project: Gcrypt
 * Created Date: 2024-01-21 15:05:04
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-21 15:09:17
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import Electron from "electron"

/**
 * 从本地系统COM Surrogate获取给定文件的缩略图，JPEG压缩处理后返回图像Buffer
 * @param filePath 文件在本地文件系统上的路径
 */
const getThumbnailFromSystem = async (filePath: string,
    options: { height: number, width: number, quality: number }): Promise<string> => {
    const res = await (await Electron
        .nativeImage
        .createThumbnailFromPath(filePath, { height: options.height, width: options.width }))
        .toJPEG(options.quality)
        .toString('base64')
    if (!res) {
        throw new Error()
    } else {
        return res
    }
}

export default getThumbnailFromSystem
