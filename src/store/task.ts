/**
 * File: \src\store\task.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-19 15:50:06
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import Task from '@/api/Task'
import { defineStore } from 'pinia'

export const useTaskStore = defineStore("task", {
    state() {
        return {
            taskPool: [] as Array<Task>
        }
    },
    actions: {
        /**
         * 增加新任务（单个）
         * @param task
         * @param options
         */
        addTask(task: Task, options: {
            runImmediately?: boolean,
        }) {
            if (task.state === 'pending') {
                this.taskPool.push(task)
            }
            if (options?.runImmediately) {
                task.run()
            }
        },

        /**
         * 以指定数量去运行task pool中的任务（无论什么状态），没啥用，而且容易出错
         * @param count 运行的任务数
         */
        async runTasks(count?: number) {
            for (let i = 0; (i < count) && (i < this.taskPool.length); i++) {
                await this.taskPool[i].run()
            }
        },

        /**
         * 运行任务组
         * @param groupId 任务组id
         * @param parallel 是否并行执行Promise
         * @returns 是否全部任务均成功
         */
        async runTaskGroup(groupId: string, options?: { parallel?: boolean }) {
            const matchedTasks: Task[] = this.taskPool.filter((item) => item.groupId === groupId)
            let isAnyTaskFailed = false

            if (options?.parallel) {
                Promise.all(matchedTasks.map(item => item.run())).catch(() => {
                    isAnyTaskFailed = true
                })
            } else {
                for (let i = 0; i < matchedTasks.length; i++) {
                    await matchedTasks[i].run()
                    if (matchedTasks[i].state === 'failed') {
                        // 有任一任务出错
                        isAnyTaskFailed = true
                    }
                }
            }

            return !isAnyTaskFailed
        },

        /**
         * 清理已取消或成功的任务
         */
        clean() {
            this.taskPool = this.taskPool.filter(item => {
                return (item.state !== 'cancelled') && (item.state !== 'succeed')
            })
        },

        /**
         * 获取等待中或者进行中任务的数量
         * @returns 任务数
         */
        getPendingOrRunningTaskAmount(): number {
            return this.taskPool.reduce((ans, val) => {
                if (val.state === 'pending' || val.state === 'running') {
                    return ans + 1
                } else {
                    return ans
                }
            }, 0)
        }
    }
}
)
