<template>
    <v-system-bar window style="-webkit-app-region: drag;padding-right: 0px;" height="32">
        <span class="ml-2">隐域-Gcrypt v{{ mainStore.appVersion }}</span>
        <v-chip class="ma-2" color="red" size="x-small" v-if="sharedUtils.env === 'development'">
            dev
        </v-chip>
        <v-chip class="ma-2" color="green" size="x-small" v-if="sharedUtils.env === 'production'">
            prod
        </v-chip>
        <v-spacer />
        <div v-ripple class="system-bar-item" v-for="item in itemList.filter(i => !i.hide)" :key="item.name"
            @click="item.onClick" :class="item.class">
            <v-icon>
                {{ item.icon }}
            </v-icon>
            <v-tooltip activator="parent" location="bottom">
                {{ item.tooltip }}
            </v-tooltip>
        </div>

    </v-system-bar>
</template>

<script setup lang="ts">
import { computed } from "vue"
import Electron from "electron"
import { useMainStore } from "@/store/main"
import { useSettingsStore } from "@/store/settings"
import sharedUtils from "@/utils/sharedUtils";
import emitter from "@/eventBus";

const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const itemList = computed(() => {
    return [
        {
            name: 'devtools',
            tooltip: '切换开发者工具',
            onClick: () => {
                Electron.ipcRenderer.send('mainService',
                    { code: "toggleDT" })
            },
            icon: 'mdi-code-tags',
            class: 'system-bar-item-normal',
            hide: false
        },
        {
            name: 'reload',
            tooltip: '重载主渲染进程',
            onClick: () => {
                Electron.ipcRenderer.send('mainService',
                    { code: "reload" })
            },
            icon: 'mdi-reload',
            class: 'system-bar-item-normal',
            hide: false
        },
        {
            name: 'lock',
            tooltip: '锁定应用',
            onClick: () => {
                emitter.emit("Action::toggleAppLocker")
            },
            icon: 'mdi-lock-outline',
            class: 'system-bar-item-normal',
            hide: !settingsStore.getSetting("window_lock")
        },
        {
            name: 'minimize',
            tooltip: '最小化窗口',
            onClick: () => {
                Electron.ipcRenderer.send('mainService',
                    { code: "minimize" })
            },
            icon: 'mdi-minus',
            class: 'system-bar-item-normal',
            hide: false
        },
        {
            name: 'maximize',
            tooltip: '最大化窗口',
            onClick: () => {
                Electron.ipcRenderer.send('mainService',
                    { code: "maximize" })
            },
            icon: 'mdi-window-maximize',
            class: 'system-bar-item-normal',
            hide: false
        },
        {
            name: 'close',
            tooltip: '关闭应用',
            onClick: () => {
                Electron.ipcRenderer.send('mainService',
                    { code: "close" })
            },
            icon: 'mdi-close',
            class: 'system-bar-item-danger',
            hide: false
        }

    ]
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.system-bar-item {
    height: 32px;
    width: 45px;
    overflow: hidden;
    transition: all 0.3s;
    -webkit-app-region: no-drag;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;

}

.system-bar-item-normal:hover {
    background-color: rgba(128, 128, 128, 0.5);
}

.system-bar-item-danger:hover {
    background-color: rgba(255, 29, 29, 0.9);
}
</style>
