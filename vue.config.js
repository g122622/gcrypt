/* eslint-disable quote-props */
const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack');
const path = require('path');

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

module.exports = defineConfig({
    transpileDependencies: true,
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
                }
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
            'F:/gcrypt/gcrypt/lib/binding/napi-v6-win32-unknown-x64/node_sqlite3.node': 'require("F:/gcrypt/gcrypt/lib/binding/napi-v6-win32-unknown-x64/node_sqlite3.node")'
        }
        config.resolve = {
            extensions: ['.js', '.vue', '.json', '.ts'],
            alias: {
                // 在 webpack 中设置代码中 @ 符号表示 src 这一层目录
                '@': require("path").join(__dirname, './src/')

            }
        }
        config.plugins.push(new webpack.DefinePlugin({
            COMPILE_DATE: JSON.stringify(new Date().toLocaleString()),
            COMPILE_NUMBER: JSON.stringify(generateBuildNumber())
        }))
    },
    chainWebpack: config => {
        function resolvePath(...dir) {
            return path.join(__dirname, ...dir)
        }
        config.resolve.alias
            .set("@", resolvePath("src"))
    }
})
