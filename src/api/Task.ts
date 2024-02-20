/**
 * File: \src\api\Task.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-19 15:54:39
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import sharedUtils from "@/utils/sharedUtils"

class Task {
    public state: 'pending' | 'running' | 'succeed' | 'failed' | 'cancelled'
    private taskHandler: (() => void) | (() => Promise<void>)
    private lastError = null
    public guid: string
    public name: string
    public groupId: string
    public errorHandler: (err) => void

    /**
     * 构造一个任务
     * @param taskHandler 任务处理函数，必须具有良好的异步性
     * @param options 选项
     */
    constructor(taskHandler: (() => void) | (() => Promise<void>),
        options: { name: string, groupId?: string, errorHandler?: (err) => void }) {
        this.taskHandler = taskHandler
        this.guid = sharedUtils.getHash(16)
        this.name = options.name
        this.groupId = options.groupId
        this.state = 'pending'
    }

    /**
     * 运行任务，不会抛出异常
     * @returns void
     */
    public async run(): Promise<void> {
        if (this.state === 'cancelled' || this.state === 'running') {
            return
        }
        try {
            this.state = 'running'
            await this.taskHandler()
            this.state = 'succeed'
        } catch (err) {
            this.state = 'failed'
            this.lastError = err
            if (this.errorHandler) {
                this.errorHandler(err)
            }
        }
    }

    public cancell() {
        if (this.isCancellable()) {
            this.state = 'cancelled'
        }
    }

    public isCancellable() {
        return this.state === 'pending'
    }

    public getLastError() {
        return this.lastError
    }
}

export default Task
