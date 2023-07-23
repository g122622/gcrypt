import { createApp } from 'vue';
import router from './router';
import { useMainStore } from "./store/main";
import { useSettingsStore } from "./store/settings";
import { createPinia } from "pinia";
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import emitter from "./eventBus";
import Electron from "electron";
import utils from "./utils/utils";
import lodash, { debounce } from "lodash";
import { nextTick } from 'process';

// 全局组件
import VueApp from './App.vue';
import BottomTip from "./components/shared/BottomTip.vue";
import ActionToolBarBase from "./components/shared/ActionToolBarBase.vue";
import IconBtn from "./components/shared/IconBtn.vue";
import DialogGenerator from "./components/shared/DialogGenerator.vue";
import AdvancedList from "./components/shared/AdvancedList.vue";
import ToolBarBase from './components/shared/ToolBarBase.vue';

let pinia;

/**
 * 常见BUG合集
 * 1.读取和修改ref没有加.value
 * 2.函数返回值或参数有时需要深拷贝
 * 3.async函数调用时没有加await
 * 4.await后的括号
 */
/*
一.事件命名规范:
    1.UI事件 只传达某个UI状态改变的信息
        UI::contextMenu::clickOutside
    2.Action 强调动作
        Action::showMsg
    3.LifeCycle 生命周期事件
        LifeCycle::finishedLoadingApp
        LifeCycle::outOfMem
        LifeCycle::clearMem
*/

class Application {
    private AppInstance
    private MainStore
    private SettingsStore

    private initEvents() {
        global.emitter = emitter

        window.addEventListener('error', function (event) {
            // onerror_statements
            console.log(event)
            const str = `主窗口渲染进程发生代码执行错误，错误栈消息如下：${event.error.stack}`
            emitter.emit('showMsg', { level: "error", msg: str });
        })

        emitter.on("resetSettings", () => {
            nextTick(() => {
                // 通知store
                this.SettingsStore.resetSettings()
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

        emitter.on('applySettings', () => {
            this.applySettings()
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
            if (this.SettingsStore.getSetting("use_shade")) {
                console.log("shader on!");
                emitter.emit("showShade");
            } else {
                emitter.emit("closeShade");
            }
            // 窗口置顶
            if (this.SettingsStore.getSetting("on_top")) {
                emitter.emit("setOnTop");
            } else {
                emitter.emit("unsetOnTop");
            }
            // 夜间模式
            if (this.SettingsStore.getSetting("is_dark")) {
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
        // eslint-disable-next-line dot-notation
        window['pinia'] = pinia
    }

    private initVue() {
        // 创建Vue实例
        this.AppInstance = createApp(VueApp)
        // 注入全局变量和全局组件
        this.AppInstance.config.globalProperties.$utils = utils
        this.AppInstance.config.globalProperties.$emitter = emitter
        this.AppInstance.config.globalProperties.$lodash = lodash
        this.AppInstance.component("BottomTip", BottomTip)
            .component("ActionToolBarBase", ActionToolBarBase)
            .component("IconBtn", IconBtn)
            .component("DialogGenerator", DialogGenerator)
            .component("AdvancedList", AdvancedList)
            .component("ToolBarBase", ToolBarBase)

        // 使用插件
        this.AppInstance.use(router)
        this.AppInstance.use(vuetify)
        this.AppInstance.use(pinia)
        this.MainStore = useMainStore()
        this.SettingsStore = useSettingsStore()
        // 根节点挂载
        this.AppInstance.mount('#app')
    }

    private showNotesInConsole() {
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

    private initSettingsObserver() {
        this.SettingsStore.$subscribe(debounce(() => {
            this.applySettings()
            this.SettingsStore.saveSettings()
        }, 500))
    }

    public initAll() {
        const startTime = Date.now()
        loadFonts()
        this.initEvents()
        this.initPinia()
        this.initVue()
        if (this.MainStore.appVersion !== this.MainStore.appVersionOld) {
            this.SettingsStore.updateSettings()
        }
        this.initSettingsObserver()
        this.applySettings()
        this.showNotesInConsole()
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
