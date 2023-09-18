import FileActiveState from '@/types/FileActiveState'
import { defineStore } from 'pinia'
import ElectronStore from 'electron-store'

// 初始化electron-store
const mainStore = new ElectronStore({
    name: "main",
    fileExtension: "json",
    clearInvalidConfig: true,
})

export const useMainStore = defineStore("main", {
    state() {
        return {
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            COMPILE_PLATFORM: COMPILE_PLATFORM,
            COMPILE_ENV: COMPILE_ENV,
            COMPILE_CPU: COMPILE_CPU,
            COMPILE_MEM: COMPILE_MEM,
            notifications: [],
            mainContentScrollable: true,
            activeFiles: new Map() as Map<string, FileActiveState>,
            appVersion: mainStore.get("appVersion") as string,
            appVersionOld: mainStore.get("appVersionOld") as string,
        }
    },
    actions: {
        setFileActiveState(fileguid, statusName, statusValue) {
            if (!this.activeFiles.has(fileguid)) {
                this.activeFiles.set(fileguid, <FileActiveState>{ file: null, isOpen: false, isUsingTempFile: false })
            }
            this.activeFiles.get(fileguid)[statusName] = statusValue
        }
    }
}
)
