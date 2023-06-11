import FileActiveState from '@/types/FileActiveState'
import { defineStore } from 'pinia'

export const useMainStore = defineStore("main", {
    state() {
        return {
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            notifications: [],
            mainContentScrollable: true,
            activeFiles: new Map() as Map<string, FileActiveState>,
        }
    },
    actions: {
        setFileActiveState(fileguid, statusName, statusValue) {
            if (!this.activeFiles.has(fileguid)) {
                this.activeFiles.set(fileguid, { state: {}, file: null })
            }
            this.activeFiles.get(fileguid)[statusName] = statusValue
        }
    }
}
)
