/**
 * File: \src\components\FileMgr\types\FileMgrOptions.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-21 15:23:58
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

export interface FileMgrOptions {
    useCtxMenu: boolean,
    useThumbnails: boolean,
    exposeSelection: boolean,
    allowMultipleSelection: boolean,
    onlyAllowFolderSelection: boolean
}
