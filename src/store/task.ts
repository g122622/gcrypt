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
        async runTaskGroup(groupId: string) {
            for (let i = 0; i < this.taskPool.length; i++) {
                if (this.taskPool[i].groupId === groupId) {
                    await this.taskPool[i].run()
                }
            }
        },
        clean() {
            this.taskPool = this.taskPool.filter(item => {
                return (item.state !== 'cancelled') && (item.state !== 'succeed')
            })
        }
    }
}
)
