import { createStore } from 'vuex'
import ElectronStore from 'electron-store'
import defaultSettings from "@/assets/json/defaultSettings";

// 初始化electron-store
const settingStore = new ElectronStore({
    name: "settings", // 文件名称,默认 config
    fileExtension: "json", // 文件后缀,默认json
    clearInvalidConfig: true, // 发生 SyntaxError  则清空配置
})

export default createStore({
    state() {
        if (!settingStore.has('timestamp')) {
            settingStore.store = { settings: defaultSettings, timestamp: Date.now() }
        }
        return {
            settings: settingStore.get("settings"),
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            notifications: []
        }
    },
    mutations: {
        // 只有窗口改json场景下才需带payload
        settings(state, payload) {
            if (payload) {
                state.settings = payload
            }
            settingStore.set("settings", state.settings)
            settingStore.set("timestamp", Date.now())
        },
        resetSettings(state){
            state.settings= defaultSettings
            settingStore.set("settings", state.settings)
            settingStore.set("timestamp", Date.now())
        }
    },
    getters: {
        settings(state) {
            return state.settings
        },
        'COMPILE_DATE'(state) {
            return state.COMPILE_DATE
        },
        'COMPILE_NUMBER'(state) {
            return state.COMPILE_NUMBER
        }
    }
})