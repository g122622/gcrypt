/**
 * File: \src\utils\helpers\Lock.ts
 * Project: Gcrypt
 * Created Date: 2024-02-16 15:32:34
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-16 16:23:40
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

class Lock {
    // 等待队列
    public lockedQueue = null

    public async lock() {
        if (this.lockedQueue === null) {
            this.lockedQueue = []
        } else {
            await new Promise(resolve => this.lockedQueue.push(resolve))
        }
    }

    public unlock() {
        if (this.lockedQueue && this.lockedQueue.length) {
            this.lockedQueue.shift()()
        } else {
            this.lockedQueue = null
        }
    }
}

export default Lock
