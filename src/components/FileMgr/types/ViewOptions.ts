/**
 * File: \src\components\FileMgr\types\ViewOptions.ts
 * Project: Gcrypt
 * Created Date: 2024-01-14 17:17:51
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-14 17:21:29
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

export interface ViewOptions {
    itemDisplayMode: number, // 0 list, 1 item
    itemSize: number, // 区间[0,10]的整数, '5' stands for medium size
    sortBy: number, // 0 name, 1 timeModifyF
    folderFirst: number,
    sequence: number, // 0 ascending | 1 descending
    showHiddenItem: number,
    showExtName: number,
    showThumbnails: number
}
