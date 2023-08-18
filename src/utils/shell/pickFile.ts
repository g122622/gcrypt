import emitter from "@/eventBus"
import sharedUtils from "../sharedUtils"

export default function pickFile(directory: string, onlyAllowFolderSelection: boolean, allowMultipleSelection: boolean, useBuiltin = true): Promise<string[]> {
    return new Promise((resolve) => {
        if (useBuiltin) {
            const taskId = sharedUtils.getHash(16)
            emitter.emit("Action::openFilePicker", { directory, taskId, onlyAllowFolderSelection, allowMultipleSelection })
            emitter.on("Action::filePicked" + taskId, (result: string[]) => {
                resolve(result)
            })
        } else {
            const inputElement = document.createElement("input")
            inputElement.type = 'file'
            inputElement.style.display = 'none'
            if (onlyAllowFolderSelection) {
                inputElement.toggleAttribute('webkitdirectory', true)
            }
            document.body.appendChild(inputElement)
            inputElement.onchange = () => {
                const fileList = inputElement.files
                const result = []
                for (let i = 0; i < fileList.length; i++) {
                    result.push(fileList[i].path)
                }
                resolve(result)
                document.body.removeChild(inputElement)
            }
            inputElement.click()
        }
    })
}
