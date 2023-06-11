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

export const useSettingsStore = defineStore("settings", {
    state() {
        if (!settingStore.has('timestamp')) {
            settingStore.store = { settings: defaultSettings, timestamp: Date.now() }
        }
        return {
            settings: <Array<settingItem>>settingStore.get("settings"),
        }
    },
    actions: {
        /**
         * 保存设置到本地磁盘
         */
        saveSettings() {
            settingStore.set("settings", this.settings)
            settingStore.set("timestamp", Date.now())
        },
        resetSettings() {
            this.settings = defaultSettings
            this.saveSettings()
        },
        setSetting(name: string, value) {
            this.settings.find(item => item.name === name).value = value
            this.saveSettings()
        },
        getSetting(name: string) {
            return this.settings.find(item => item.name === name).value
        }
    }
}
)
