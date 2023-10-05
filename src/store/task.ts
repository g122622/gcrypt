import Task from '@/api/Task'
import { defineStore } from 'pinia'

export const useTaskStore = defineStore("task", {
    state() {
        return {
            taskPool: [] as Array<Task>
        }
    },
    actions: {
        addTask(task: Task, options: {
            runImmediately?: boolean,
        }) {
            if (task.state === 'pending') {
                this.taskPool.push(task)
            }
            if (options?.runImmediately) {
                task.run() // do not await
            }
        },
        async runTasks(count?: number) {
            for (let i = 0; (i < count) && (i < this.taskPool.length); i++) {
                await this.taskPool[i].run()
            }
        },
        /**
         * 运行任务组
         * @param groupId 任务组id
         * @param parallel 是否并行执行Promise
         */
        async runTaskGroup(groupId: string, parallel = false) {
            const matchedTasks = this.taskPool.filter((item) => item.groupId === groupId)
            if (parallel) {
                await Promise.all(matchedTasks.map(item => item.run()))
            } else {
                for (let i = 0; i < matchedTasks.length; i++) {
                    await matchedTasks[i].run()
                }
            }
        },
        clean() {
            this.taskPool = this.taskPool.filter(item => {
                return (item.state !== 'cancelled') && (item.state !== 'succeed')
            })
        },
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
