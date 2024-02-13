const log = function (arg: string) {
    console.log(
        `%c@ LOG | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #3f51b5;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [
            arg
        ].join('')
    )
}

const error = function (arg: string) {
    console.log(
        `%c@ ERROR | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #eb5c5a;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [
            arg
        ].join('')
    )
    console.trace()
}

const warn = function (arg: string) {
    console.log(
        `%c@ WARNING | at ${new Date().toLocaleTimeString()}::${new Date().getMilliseconds()}`,
        `
          background-color: #fbc02d;
          color: #eee;
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
        `,
        [
            arg
        ].join('')
    )
}

export { log, error, warn }
