import fileTypes from "../types/fileTypes";

function getFileType(filename: string) {
    if (filename.indexOf(".") === -1) {
        return "unknown"
    }
    const extName = filename.split(".").pop()

    const keys = Object.keys(fileTypes)
    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < fileTypes[keys[i]].length; j++) {
            if (fileTypes[keys[i]][j] === extName) {
                return keys[i]
            }
        }
    }
    return "unknown"
}

export default getFileType
