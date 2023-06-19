import { defineStore } from 'pinia'
import ElectronStore from "electron-store"

// 初始化electron-store
const diskStore = new ElectronStore({
    name: "encryption",
    fileExtension: "json",
    encryptionKey: "gcrypt", // 对配置文件进行加密
    clearInvalidConfig: false, // 发生 SyntaxError  则清空配置
})

// 与encryption相关的状态都放在这里
export const useMainStore = defineStore("encryption", {
    state() {
        return {
            storeList: diskStore.get("storeList", [])
        }
    },
    actions: {
        save() {
            diskStore.set("storeList", this.storeList)
        }
    }
}
)
