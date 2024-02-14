/**
 * File: \src\api\core\types\FileTable.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 11:51:09
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import DirSingleItem from "./DirSingleItem";

interface FileTable {
    items: Array<DirSingleItem>,
    selfKey: string
}

export default FileTable
