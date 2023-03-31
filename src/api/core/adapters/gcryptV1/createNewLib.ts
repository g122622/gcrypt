// /* eslint-disable @typescript-eslint/no-var-requires */
// import { log } from "../../../../utils/gyConsole";
// import path from "path";
// import emitter from "../../../../eventBus"
// import sharedUtils from "../../../../utils/sharedUtils"

// // eslint-disable-next-line no-global-assign
// __dirname = "F:/gcrypt/gcrypt/src"

// log(require('@mapbox/node-pre-gyp').find(path.resolve(path.join(__dirname, '../package.json'))))

// const sqlite3 = require('sqlite3')
// const fs = require('fs')
// let db = null

// const createNewLib = function (dbsrc: string) {
//     fs.exists(dbsrc, exists => {
//         if (exists) {
//             emitter.emit("showMsg", { level: 'error', msg: `加密库已存在` })
//         } else {
//             // fs.writeFileSync(dbsrc, '')
//             db = new sqlite3.Database(dbsrc, (e) => {
//                 if (e) {
//                     emitter.emit("showMsg", { level: 'error', msg: `加密库打开失败：${e.stack}` })
//                 }
//                 emitter.emit("showMsg", { level: 'success', msg: `加密库打开成功` })

//                 db.prepare(`create table meta(
//                     createdDate integer,
//                     modifiedDate integer,
//                     name text,
//                     entryKey text,
//                     versionHash text,
//                     coreVersion text,
//                     comment text
//                 )`).run().finalize()

//                 db.prepare(`create table data(
//                     key text
//                 )`).run(() => {
//                     db.prepare(`insert into data values (?);`).run(sharedUtils.getHash(32), function (err) {
//                         if (err) throw err
//                     })
//                 }).finalize()

//                 finalize()
//             })
//         }
//     })
// }

// const finalize = function () {
//     db.close()
//     db = null
// }

// export default createNewLib
