import { defineStore } from "pinia";
import ElectronStore from "electron-store";
import defaultSettings from "@/assets/json/defaultSettings";
import settingItem from "@/types/settingItem";
import { log } from "@/utils/gyConsole";
import { cloneDeep } from "lodash";
import SettingTypes from "@/types/settingTypes";

// 初始化electron-store
const settingStore = new ElectronStore({
    name: "settings",
    fileExtension: "json",
    clearInvalidConfig: true
});

export const useSettingsStore = defineStore("settings", {
    state() {
        if (!settingStore.has("timestamp")) {
            settingStore.store = { settings: defaultSettings, timestamp: Date.now() };
        }
        return {
            settings: <Array<settingItem>>settingStore.get("settings")
        };
    },
    actions: {
        /**
         * 保存设置到本地磁盘
         */
        saveSettings() {
            settingStore.set("settings", this.settings);
            settingStore.set("timestamp", Date.now());
            log("设置保存成功");
        },
        resetSettings() {
            this.settings = defaultSettings;
        },
        setSetting(name: string, value) {
            this.settings.find(item => item.name === name).value = value;
        },
        getSetting(name: string) {
            try {
                return this.settings.find(item => item.name === name).value;
            } catch (e) {
                this.updateSettings();
            }
        },
        hasSetting(name: string) {
            return !!this.settings.find(item => item.name === name);
        },
        updateSettings() {
            let temp: settingItem[] = [];
            defaultSettings.forEach(item => {
                temp.push(cloneDeep(item));
                // 不是新的设置项
                if (this.hasSetting(item.name)) {
                    // 特殊地，按钮的value需要更新
                    if (item.type !== SettingTypes.button) {
                        temp[temp.length - 1].value = this.getSetting(item.name);
                    }
                }
            });
            this.settings = temp;
        }
    }
});
