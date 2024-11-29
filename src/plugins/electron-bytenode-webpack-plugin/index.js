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
        if (process.env.NODE_ENV === "development") {
            return
        }
		return;
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
                                prefix += `
        ~function(){
            const ok=require("assert").strict["ok"],{brotliCompressSync,brotliDecompressSync}=require("zlib"),fs=require("fs"),vm=require("vm"),v8=require("v8"),path=require("path"),Module=require("module"),COMPILED_EXTNAME=(v8.setFlagsFromString("--no-lazy"),12<=Number.parseInt(process.versions.node,10)&&v8.setFlagsFromString("--no-flush-bytecode"),".jsc"),MAGIC_NUMBER=Buffer.from([222,192]),ZERO_LENGTH_EXTERNAL_REFERENCE_TABLE=Buffer.alloc(2);function generateScript(e,r){isBufferV8Bytecode(e)||(e=brotliDecompressSync(e),ok(isBufferV8Bytecode(e),"Invalid bytecode buffer")),fixBytecode(e);var a=readSourceHash(e);let o="";1<a&&(o='"'+"​".repeat(a-2)+'"');a=new vm.Script(o,{cachedData:e,filename:r});if(a.cachedDataRejected)throw new Error("Invalid or incompatible cached data (cachedDataRejected)");return a}function isBufferV8Bytecode(e){return Buffer.isBuffer(e)&&!e.subarray(0,2).equals(ZERO_LENGTH_EXTERNAL_REFERENCE_TABLE)&&e.subarray(2,4).equals(MAGIC_NUMBER)}const compileCode=function(e,r){e=new vm.Script(e,{produceCachedData:!0});let a=e.createCachedData&&e.createCachedData.call?e.createCachedData():e.cachedData;return a=r?brotliCompressSync(a):a},fixBytecode=function(e){if(!Buffer.isBuffer(e))throw new Error("bytecodeBuffer must be a buffer object.");var r=compileCode('"ಠ_ಠ"'),a=parseFloat(process.version.slice(1,5));process.version.startsWith("v8.8")||process.version.startsWith("v8.9")?(r.subarray(16,20).copy(e,16),r.subarray(20,24).copy(e,20)):12<=a&&a<=21?r.subarray(12,16).copy(e,12):(r.subarray(12,16).copy(e,12),r.subarray(16,20).copy(e,16))},readSourceHash=function(e){if(Buffer.isBuffer(e))return process.version.startsWith("v8.8")||process.version.startsWith("v8.9")?e.subarray(12,16).reduce((e,r,a)=>e+r*Math.pow(256,a),0):e.subarray(8,12).reduce((e,r,a)=>e+r*Math.pow(256,a),0);throw new Error("bytecodeBuffer must be a buffer object.")};Module._extensions[COMPILED_EXTNAME]=function(a,e){var r=generateScript(fs.readFileSync(e),e);function o(e){return a.require(e)}o.resolve=function(e,r){return Module._resolveFilename(e,a,!1,r)},process.mainModule&&(o.main=process.mainModule),o.extensions=Module._extensions,o.cache=Module._cache;var r=r.runInThisContext({filename:e,lineOffset:0,columnOffset:0,displayErrors:!0}),t=path.dirname(e),e=[a.exports,o,a,e,t,process,global];return r.apply(a.exports,e)};
            }()
        const path = require('path')
                                `
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
