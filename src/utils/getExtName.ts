function getExtName(arg: string) {
    const tokens = arg.split(".")
    if (tokens.length <= 1) {
        return ""
    } else {
        return tokens.pop()
    }
}

export default getExtName
