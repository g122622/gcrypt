import sharedUtils from "@/utils/sharedUtils"

class Task {
    public state: 'pending' | 'running' | 'succeed' | 'failed' | 'cancelled'
    private taskHandler: (() => void) | (() => Promise<void>)
    private lastError = null
    public guid: string
    public name: string
    public groupId: string

    constructor(taskHandler: (() => void) | (() => Promise<void>), name: string, groupId?: string) {
        this.taskHandler = taskHandler
        this.guid = sharedUtils.getHash(16)
        this.name = name
        this.groupId = groupId
        this.state = 'pending'
    }

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
