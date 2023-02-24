import { createApp } from 'vue'
import VueApp from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import emitter from "./eventBus";
import Electron from "electron";
import utils from "./utils/utils";
import ElectronStore from 'electron-store'
import lodash from "lodash"

class App {
    private AppInstance

    private initEvents() {
        emitter.on("updateSettings", () => {
            // 应用设置
            this.applySettings();

            // 保存设置
            store.commit("settings");

            // 通知用户
            emitter.emit('showMsg', { level: "success", msg: "设置保存成功" });
        })

        emitter.on("showShade", () => {
            Electron.ipcRenderer.send('new-message', { code: "showShade" })
        })

        emitter.on("closeShade", () => {
            Electron.ipcRenderer.send('new-message', { code: "closeShade" })
        })

        emitter.on("setOnTop", () => {
            Electron.ipcRenderer.send('new-message', { code: "setOnTop" })
        })

        emitter.on("unsetOnTop", () => {
            Electron.ipcRenderer.send('new-message', { code: "unsetOnTop" })
        })
    }

    private applySettings() {
        setTimeout(() => {
            // 黑色遮罩
            if (store.getters.settings.filter(item => item.name === "use_shade")[0].value) {
                console.log("shader on!");
                emitter.emit("showShade");
            } else {
                emitter.emit("closeShade");
            }
            // 窗口置顶
            if (store.getters.settings.filter(item => item.name === "on_top")[0].value) {
                emitter.emit("setOnTop");
            } else {
                emitter.emit("unsetOnTop");
            }
            // // 颜色主题
            // if (store.getters.settings.filter(item => item.name === "is_dark")[0].value) {
            //     theme.global.name.value = 'dark'
            // } else {
            //     theme.global.name.value = 'light'
            // }
        }, 100)
    }

    private initVue() {
        // 创建Vue实例
        this.AppInstance = createApp(VueApp)
        // 注入全局变量
        this.AppInstance.config.globalProperties.$utils = utils
        this.AppInstance.config.globalProperties.$emitter = emitter
        this.AppInstance.config.globalProperties.$lodash = lodash
        // 初始化electron-store
        this.AppInstance.config.globalProperties.$electronStore = new ElectronStore({
            name: "data", // 文件名称,默认 config
            fileExtension: "json", // 文件后缀,默认json
            //  cwd: Electron.app.getPath('userData'), // 文件位置,尽量不要动，默认情况下，它将通过遵循系统约定来选择最佳位置。C:\Users\xxx\AppData\Roaming\test\config.json
            encryptionKey: "aes-256-cbc", // 对配置文件进行加密
            clearInvalidConfig: true, // 发生 SyntaxError  则清空配置
        })
        // 使用插件并挂载
        this.AppInstance.use(router)
        this.AppInstance.use(store)
        this.AppInstance.use(vuetify)
        this.AppInstance.mount('#app')
    }

    private showConsole() {
        console.log(
            '%cNOTE | Early development',
            `
      background-color: #3f51b5;
      color: #eee;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    `,
            [
                'The app is in early development (prototyping) stage. ',
                'I will gradually refactor and optimize the codebase in future updates.'
            ].join('')
        )
        console.log(
            '%cNOTE | Performance',
            `
      background-color: #3f51b5;
      color: #eee;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 4px;
    `,
            [
                'Keep in mind: DevTools window uses a lot of resources (RAM, CPU, GPU); ',
                'Dev build is slower and uses more resources than production build.',
            ].join('')
        )
    }

    private toggleDevTools() {
        Electron.ipcRenderer.send('new-message', { code: "toggleDT" })
    }

    public initAll() {
        global.emitter = emitter
        loadFonts()
        this.initEvents()
        this.initVue()
        this.showConsole()
        this.applySettings()
        if (utils.env === "development") {
            this.toggleDevTools()
        }
    }

    constructor() {
        this.initAll()
    }
}

let GcryptApp = new App()
