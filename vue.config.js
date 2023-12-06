/* eslint-disable quote-props */
const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
const path = require('path');
const process = require("process")
const os = require('os');
const BytenodeWebpackPlugin = require('./src/plugins/electron-bytenode-webpack-plugin')
const fs = require("fs-extra")

// 生成从minNum到maxNum的随机数
const randomRange = function (minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        default:
            return 0;
    }
}

const generateBuildNumber = () => {
    const mapTable = "0123456789abcdef"
    let res = ""
    for (let i = 0; i < 20; i++) {
        res += mapTable[randomRange(0, mapTable.length - 1)]
    }
    return res;
}

function prettyBytes(bytes, decimals) {
    if (isNaN(parseInt(bytes))) return 'unknown'
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals <= 0 ? 0 : decimals || 2
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

module.exports = defineConfig({
    transpileDependencies: true,
    productionSourceMap: false,
    pluginOptions: {
        electronBuilder: {
            disableMainProcessTypescript: true,
            mainProcessTypeChecking: false,
            nodeIntegration: true,
            // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
            builderOptions: {
                productName: "gcrypt-隐域",
                appId: "",
                compression: "maximum",
                // directories: {
                //     output: "build",
                // },
                // files: ["dist_electron/**/*"],
                win: {
                    icon: "public/icons/icon.ico",
                    target: "nsis",
                },
                nsis: {
                    oneClick: false,
                    allowToChangeInstallationDirectory: true,
                    displayLanguageSelector: true,
                },
            },
        },
        vuetify: {
            // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
        }
    },
    configureWebpack: (config) => {
        // renderer使用node
        config.externals = {
            'electron': 'require("electron")',
            'https': 'require("https")',
            'http': 'require("http")',
            'path': 'require("path")',
            'bytenode': 'require("bytenode")',
        }
        config.resolve = {
            extensions: ['.js', '.vue', '.json', '.ts'],
            alias: {
                // 在 webpack 中设置代码中 @ 符号表示 src 这一层目录
                '@': require("path").join(__dirname, './src/')

            }
        }

        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        config.plugins.push(new webpack.DefinePlugin({
            COMPILE_DATE: JSON.stringify(new Date().toLocaleString()),
            COMPILE_NUMBER: JSON.stringify(generateBuildNumber()),
            COMPILE_PLATFORM: JSON.stringify(process.platform + ' ' + os.version() + ' ' + os.release()),
            COMPILE_ENV: JSON.stringify(JSON.stringify(process.env, undefined, 4)),
            COMPILE_CPU: JSON.stringify(JSON.stringify(os.cpus(), undefined, 4)),
            COMPILE_MEM: JSON.stringify(`total: ${prettyBytes(totalMem)}, free: ${prettyBytes(freeMem)}`)
        }))
        console.log(JSON.stringify(os.cpus(), undefined, 4))
        config.plugins.push(new BytenodeWebpackPlugin())
    },
    chainWebpack: config => {
        function resolvePath(...dir) {
            return path.join(__dirname, ...dir)
        }
        config.resolve.alias
            .set("@", resolvePath("src"))
    }
})
