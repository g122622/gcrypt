function getFileName(src: string, withExt = false) {
    if (withExt) {
        return src.replaceAll("\\", "/").split("/").pop()
    }
    return src.replaceAll("\\", "/").split("/").pop().split(".")[0]
}

export default getFileName
