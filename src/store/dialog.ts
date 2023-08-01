import dialogBottomAction from '@/types/dialogBottomAction'
import { defineStore } from 'pinia'
import sharedUtils from "@/utils/sharedUtils";

interface Dialog {
    isDialogOpen: boolean,
    footer?: string,
    title: string,
    bottomActions?: Array<dialogBottomAction>,
    isPersistent?: boolean,
    width?: string,
    height?: string,
    destroyAfterClose: boolean,
    HTMLContent?: string,
    guid: string
}

export const useDialogStore = defineStore("dialog", {
    state() {
        return {
            dialogs: new Set() as Set<Dialog>
        }
    },
    actions: {
        addDialog(dialog: Omit<Dialog, "guid">) {
            const guid = sharedUtils.getHash(16)
            this.dialogs.add({ ...dialog, guid })
        },
        remove(guid: string) {
            let tmp = null
            this.dialogs.forEach(item => {
                if (item.guid === guid) {
                    tmp = item
                }
            })
            this.dialogs.delete(tmp)
        }
    }
}
)
