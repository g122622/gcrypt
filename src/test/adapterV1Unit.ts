// import Addr from '../api/core/common/Addr'
// import adapter from '../api/core/adapters/gcryptV1/adapter'
// import { log, warn } from '../utils/gyConsole'

// export default async function test() {
//     warn("adapter test started")
//     await adapter.initAdapter("E:/暂存/新建文件夹 (17)/test.json", "pwd")
//     await adapter.mkdir("new folder1")
//     await adapter.mkdir("new folder2")
//     await adapter.mkdir("new folder3")
//     adapter.changeCurrentDirectory(new Addr("/new folder2/"))
//     await adapter.mkdir("new folder21")
//     await adapter.writeFile("test file", Buffer.from("I am content"))
//     console.log(adapter.readFile("test file").toString())
//     await adapter.mkdir("new folder22")
//     await adapter.mkdir("new folder23")
//     adapter.changeCurrentDirectory(new Addr("/new folder2/new folder23"))
//     await adapter.mkdir("new folder231")
// }
