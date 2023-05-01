import { defineStore } from 'pinia'
import ElectronStore from 'electron-store'
import defaultSettings from "@/assets/json/defaultSettings";
import settingItem from '@/types/settingItem';

// 初始化electron-store
const settingStore = new ElectronStore({
    name: "settings", // 文件名称,默认 config
    fileExtension: "json", // 文件后缀,默认json
    clearInvalidConfig: true, // 发生 SyntaxError  则清空配置
})

export const useMainStore = defineStore("main", {
    state() {
        if (!settingStore.has('timestamp')) {
            settingStore.store = { settings: defaultSettings, timestamp: Date.now() }
        }
        return {
            settings: <Array<settingItem>>settingStore.get("settings"),
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            notifications: [],
            mainContentScrollable: true,
        }
    },
    actions: {
        setSettings() {
            settingStore.set("settings", this.settings)
            settingStore.set("timestamp", Date.now())
        },
        resetSettings() {
            this.settings = defaultSettings
            settingStore.set("settings", this.settings)
            settingStore.set("timestamp", Date.now())
        }
    }
}
)
