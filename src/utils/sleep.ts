const sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(ms)
        }, ms)
    })
}

export default sleep
