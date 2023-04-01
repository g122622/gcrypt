import { createStore } from 'vuex'
import ElectronStore from 'electron-store'
import defaultSettings from "@/assets/json/defaultSettings";
import settingItem from '@/types/settingItem';

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
            settings: <Array<settingItem>>settingStore.get("settings"),
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            notifications: [],
            mainContentScrollable: true
        }
    },
    mutations: {
        settings(state: any) {
            settingStore.set("settings", state.settings)
            settingStore.set("timestamp", Date.now())
        },
        resetSettings(state: any) {
            state.settings = defaultSettings
            settingStore.set("settings", state.settings)
            settingStore.set("timestamp", Date.now())
        }
    },
    getters: {
        settings(state: any) {
            return state.settings
        },
        'COMPILE_DATE'(state: any) {
            return state.COMPILE_DATE
        },
        'COMPILE_NUMBER'(state: any) {
            return state.COMPILE_NUMBER
        }
    }
})
