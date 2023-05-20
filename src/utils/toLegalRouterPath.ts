import sharedUtils from "./sharedUtils"

const toLegalRouterPath = (arg: string) => {
    /* return encodeURI(arg
        .replaceAll("/", '')
        .replaceAll('\\', ""))
    */
    return sharedUtils.getHash(16)
}

export default toLegalRouterPath
