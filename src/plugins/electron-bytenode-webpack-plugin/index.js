/* eslint-disable*/
const Module = require('module')
const bytenode = require('bytenode')

require('v8').setFlagsFromString('--no-lazy')

const lazyBundleNames = ["store", 'settings', 'about']

class BytenodeWebpackPlugin {
    constructor(options = {}) {
        this.options = Object.assign({
            compileAsModule: true,
            keepSource: false
        }, options)
    }

    apply(compiler) {
        console.log("[字节码转换器] 开始工作，当前环境: ", process.env.NODE_ENV)
        // Before emitting compiled files
        compiler.hooks.emit.tapPromise('BytenodeWebpackPlugin', async (compilation) => {
            // js文件的处理逻辑
            for (const filename in compilation.assets) {
                let keepSource = this.options.keepSource
                if (/\.js$/.test(filename)) {
                    console.log("[字节码转换器] 输入文件: ", filename)
                    if (filename.includes("libs/FroalaEditor/") || filename.includes("node_modules/")) {
                        console.log("[字节码转换器] 文件被忽略转换: ", filename)
                        continue;
                    }
                    // 获得文件内容string
                    let source = compilation.assets[filename].source()
                    const prevSize = source.length
                    // 修复vue-router的动态import问题
                    // if (filename.includes("js/app.")) {
                    //     source = source.replace(`]+".js"})()`, `]+".jsc"})()`)
                    // }
                    for (let i = 0; i < lazyBundleNames.length; i++) {
                        const bundleName = lazyBundleNames[i]
                        if (filename.includes(`js/${bundleName}.`)) {
                            // 检测到该bundle采取懒加载策略
                            const launcherSource = `
                                  try {
                                    require(path.join(process.resourcesPath, 'app.asar', '${filename.replace('.js', '.jsc')}'))
                                } catch (error) {
                                    alert("require jsc error:" + error.stack)
                                }`
                            compilation.assets[filename] = {
                                source: () => launcherSource,
                                size: () => launcherSource.length
                            }
                            keepSource = true // 保留launcher文件
                        }
                    }
                    if (this.options.compileAsModule) {
                        source = Module.wrap(source)
                    }
                    // 编译为v8字节码，emit为.jsc文件
                    const bytecode = await bytenode.compileElectronCode(source)
                    compilation.assets[filename.replace('.js', '.jsc')] = {
                        source: () => bytecode,
                        size: () => bytecode.length
                    }
                    if (!keepSource) {
                        delete compilation.assets[filename]
                    }
                    console.log("[字节码转换器] js文件编译完毕: ", filename, `编译前字数：${prevSize}编译后字节数${bytecode.length}`)
                } else if (/\.html$/.test(filename)) {
                    let source = compilation.assets[filename].source()
                    try {
                        // 替换
                        const regex = /<script defer=\"defer\" src=\"app:\/\/\.([\S]*?)\"><\/script>/g
                        let rs_exec
                        let i = 0
                        let replaces = []
                        while ((rs_exec = regex.exec(source)) != null && i < 10) {
                            console.log("[字节码转换器] rs_exec:", i, filename, rs_exec);
                            let jsc = rs_exec[1] + "c"
                            let prefix = "<script>"
                            if (i == 0) {
                                prefix += "const path=require('path');let bytenode=require('bytenode');"
                            }

                            let jscpath = "path.join(process.resourcesPath,'app.asar', '" + jsc + "')"
                            let replace = prefix + "try{require(" + jscpath + ")}catch(error){alert(\"require jsc error:\"+error.stack)}</script>"
                            source = source.replace(rs_exec[0], replace)
                            i++
                        }

                        // 取消
                        const removeRegex = /<link href=\"[\S]*?\" rel="modulepreload" as=\"script\">/g
                        source = source.replace(removeRegex, '')

                        // console.log("handled source:", source);
                        let buffer = Buffer.from(source)
                        compilation.assets[filename] = {
                            source: () => buffer,
                            size: () => buffer.length
                        }
                    } catch (error) {
                        console.log("[字节码转换器] regex error:", error);
                    }
                    console.log("[字节码转换器] html文件处理完毕: ", filename)
                }
            }
        })
    }
}

module.exports = BytenodeWebpackPlugin
