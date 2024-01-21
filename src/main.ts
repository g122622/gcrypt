/**
 * File: \src\main.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-01-21 15:48:26
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

/* eslint-disable dot-notation */
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
import notification from './api/notification';

// 全局组件
import VueApp from './App.vue';
import BottomTip from "./components/shared/BottomTip.vue";
import ActionToolBarBase from "./components/shared/ActionToolBarBase.vue";
import IconBtn from "./components/shared/IconBtn.vue";
import DialogGenerator from "./components/shared/DialogGenerator.vue";
import AdvancedList from "./components/shared/AdvancedList.vue";
import AdvancedTextField from "./components/shared/AdvancedTextField.vue";
import ToolBarBase from './components/shared/ToolBarBase.vue';
import LocalFileAdapter from './api/core/adapters/localFiles/adapter';

let pinia;
/**
 * 因为 node.js V17版本中最近发布的OpenSSL3.0,
 * 而OpenSSL3.0对允许算法和密钥大小增加了严格的限制，
 * 可能会对生态系统造成一些影响。
 * 故此以前的项目在升级 nodejs 版本后会报错。
 * 因此gcrypt项目坚持使用nodejs v16，不再更新nodejs版本和electron版本。
 * 这样做同时还可以确保编译出来的v8字节码在electron上node版本一致。
 */

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

/** 异常处理规范
 * 404类型的错误一律返回空值，不要抛出异常
 * 其他类型的错误一律抛出异常
 */

class ApplicationRenderer {
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
            // 内容保护
            Electron.ipcRenderer.send('mainService', { code: "setContentProtectionState", data: this.SettingsStore.getSetting("content_protection") })
        }, 100)
    }

    private async initGlobalAdapters() {
        window['LocalFileAdapter'] = new LocalFileAdapter()
        await window['LocalFileAdapter'].initAdapter("C:/")

        router.addRoute({
            path: '/side_column_local_file',
            name: 'side_column_local_file',
            // route level code-splitting
            // this generates a separate chunk (about.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import(/* webpackChunkName: "files" */ './components/FileMgr/FileMgr.vue'),
            props: { adapter: window['LocalFileAdapter'] }
        })
    }

    private initPinia() {
        pinia = createPinia()
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
            .component("AdvancedTextField", AdvancedTextField)

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
        notification.info(`App启动成功<br>启动耗时${e - s}ms`)
    }

    private initSettingsObserver() {
        this.SettingsStore.$subscribe(debounce(() => {
            this.applySettings()
            this.SettingsStore.saveSettings()
        }, 500))
    }

    public async initAll() {
        const startTime = Date.now()
        loadFonts()
        this.initEvents()
        await this.initGlobalAdapters()
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
    const GcryptApp = new ApplicationRenderer()
})()
