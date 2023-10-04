import emitter from "@/eventBus"
import sharedUtils from "../sharedUtils"

export default function pickDate(): Promise<Date> {
    return new Promise((resolve, reject) => {
        const taskId = sharedUtils.getHash(16)
        emitter.emit("Action::openDatePicker", { taskId })
        emitter.on("Action::datePicked" + taskId, (result: Date) => {
            resolve(result)
        })
        emitter.on("Action::datePickerCancelled" + taskId, () => {
            reject(new Error("datePickerCancelled"))
        })
    })
}
