const getCurrentProcessInfo = () => {
    return {
        arch: process.arch,
        argv: process.argv,
        config: JSON.stringify(process.config),
        cwd: process.cwd(),
        env: JSON.stringify(process.env),
        execPath: process.execPath,
    //    : process.,
    //    : process.,
    //    : process.,
    //    : process.,
    //    : process.,
    //    : process.,
   }
}

export default getCurrentProcessInfo
