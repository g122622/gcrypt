import { createApp } from 'vue'
import router from './router'
import { useMainStore } from "./store"
import { createPinia } from "pinia"
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import emitter from "./eventBus";
import Electron from "electron";
import utils from "./utils/utils";
import ElectronStore from 'electron-store'
import lodash from "lodash"
import { nextTick } from 'process'

import TagsMgr from "./api/TagsMgr";

// 全局组件
import VueApp from './App.vue'
import BottomTip from "./components/BottomTip.vue";
import ActionToolBarBase from "./components/ActionToolBarBase.vue";
import IconBtn from "./components/IconBtn.vue";
import DialogGenerator from "./components/DialogGenerator.vue";

let pinia;

/**
 * 常见BUG合集
 * 1.读取和修改ref没有加.value
 * 2.函数返回值或参数有时需要深拷贝
 * 3.async函数调用时没有加await
 */
class Application {
    private AppInstance
    private MainStore

    private initEvents() {
        global.emitter = emitter

        window.addEventListener('error', function (event) {
            // onerror_statements
            const str = `主窗口渲染进程发生代码执行错误，错误栈消息如下：${event.error.stack}`
            emitter.emit('showMsg', { level: "error", msg: str });
        })

        emitter.on("updateSettings", () => {
            // 这里的nexttick使用的是nodejs的API，不是vue的
            // electron里边事件轮询是统一的，二者等效
            nextTick(() => {
                // 应用设置
                this.applySettings();
                // 保存设置
                this.MainStore.setSettings();
                // 通知用户
                emitter.emit('showMsg', { level: "success", msg: "设置保存成功" });
            })
        })

        emitter.on("resetSettings", () => {
            nextTick(() => {
                // 通知store
                this.MainStore.resetSettings()
                // 应用设置
                this.applySettings();
                // 通知用户
                emitter.emit('showMsg',
                    {
                        level: "success",
                        msg: "设置重置成功。<br>有些设置可能需要重启app才能应用!"
                    })
            })
        })

        emitter.on("Action::addTab", (payload) => {
            TagsMgr.addTab(<any>payload)
        })

        emitter.on("Action::removeTab", (payload) => {
            TagsMgr.removeTab(<any>payload)
        })

        emitter.on("showShade", () => {
            Electron.ipcRenderer.send('mainService', { code: "showShade" })
        })

        emitter.on("closeShade", () => {
            Electron.ipcRenderer.send('mainService', { code: "closeShade" })
        })

        emitter.on("setOnTop", () => {
            Electron.ipcRenderer.send('mainService', { code: "setOnTop" })
        })

        emitter.on("unsetOnTop", () => {
            Electron.ipcRenderer.send('mainService', { code: "unsetOnTop" })
        })
    }

    private applySettings() {
        setTimeout(() => {
            // 黑色遮罩
            if (this.MainStore.settings.find(item => item.name === "use_shade").value) {
                console.log("shader on!");
                emitter.emit("showShade");
            } else {
                emitter.emit("closeShade");
            }
            // 窗口置顶
            if (this.MainStore.settings.find(item => item.name === "on_top").value) {
                emitter.emit("setOnTop");
            } else {
                emitter.emit("unsetOnTop");
            }
            // 颜色主题
            if (this.MainStore.settings.find(item => item.name === "is_dark").value) {
                vuetify.theme.global.name.value = 'DarkTheme'
                document.querySelector("#app").setAttribute("data-theme-type", "dark")
            } else {
                vuetify.theme.global.name.value = 'LightTheme'
                document.querySelector("#app").setAttribute("data-theme-type", "light")
            }
        }, 100)
    }

    private initPinia() {
        pinia = createPinia()
    }

    private initVue() {
        // 创建Vue实例
        this.AppInstance = createApp(VueApp)
        // 注入全局变量和全局组件
        this.AppInstance.config.globalProperties.$utils = utils
        this.AppInstance.config.globalProperties.$emitter = emitter
        this.AppInstance.config.globalProperties.$lodash = lodash
        this.AppInstance.component("BottomTip", BottomTip)
        this.AppInstance.component("ActionToolBarBase", ActionToolBarBase)
        this.AppInstance.component("IconBtn", IconBtn)
        this.AppInstance.component("DialogGenerator", DialogGenerator)
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
        this.AppInstance.use(vuetify)
        this.AppInstance.use(pinia)
        this.MainStore = useMainStore()
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
        Electron.ipcRenderer.send('mainService', { code: "toggleDT" })
    }

    private showFinishInitMsg(e, s) {
        emitter.emit("showMsg", {
            level: "info",
            msg: `App启动成功<br>启动耗时${e - s}ms`,
        })
    }

    public initAll() {
        const startTime = Date.now()
        console.log("init app")
        loadFonts()
        this.initEvents()
        this.initPinia()
        this.initVue()
        this.showConsole()
        this.applySettings()
        if (utils.env === "development") {
            // this.toggleDevTools()
        }
        // this.toggleDevTools()
        emitter.on("LifeCycle::finishedLoadingApp", () => {
            const endTime = Date.now()
            this.showFinishInitMsg(endTime, startTime)
        })
    }

    constructor() {
        this.initAll()
    }
}

(function () {
    const GcryptApp = new Application()
})()