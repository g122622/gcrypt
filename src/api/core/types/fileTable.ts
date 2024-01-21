/**
 * File: \src\api\core\types\fileTable.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-09 16:41:45
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import dirSingleItem from "./dirSingleItem";

interface fileTable {
    items: Array<dirSingleItem>,
    selfKey: string
}

export default fileTable
