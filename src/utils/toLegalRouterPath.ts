const toLegalRouterPath = (arg: string) => {
    return encodeURI(arg
        .replaceAll("/", '')
        .replaceAll('\\', ""))
}

export default toLegalRouterPath
