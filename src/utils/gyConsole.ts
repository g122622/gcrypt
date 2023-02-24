const log = function (arg: string) {
    console.log(
        `%cLOG | at ${new Date().toLocaleTimeString()}`,
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
        `%cERROR | at ${new Date().toLocaleTimeString()}`,
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
}

const warn = function (arg: string) {
    console.log(
        `%cWARNING | at ${new Date().toLocaleTimeString()}`,
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
