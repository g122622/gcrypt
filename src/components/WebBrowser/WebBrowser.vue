<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="网页浏览器">
            <template #prepend>
                <v-text-field :modelValue="currentSrc" placeholder="输入网址或本地路径" />
            </template>

            <IconBtn icon="mdi-refresh" @click="refresh()" tooltip="刷新页面" />
            <IconBtn icon="mdi-arrow-left" @click="back()" tooltip="后退" />
            <IconBtn icon="mdi-arrow-right" @click="forward()" tooltip="前进" />
            <IconBtn icon="mdi-TODO" @click="toggleDevTools()" tooltip="开发者工具" />
            <!-- TODO <v-radio> -->
        </ActionToolBarBase>
    </Teleport>

    <div id="web-browser-container">
        <!-- <webview :id="'webview' + guid" ref="webviewElement" /> -->
        <iframe :id="'mainFrame'+guid" class="mainFrame"/>
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, nextTick } from "vue"
import emitter from "@/eventBus"
import sharedUtils from "@/utils/sharedUtils";
import notification from "@/api/notification";

interface Props {
    src: string,
}
const props = defineProps<Props>()
const currentSrc = ref<string>(props.src || "")
const guid = sharedUtils.getHash(16)
let webviewElement = null
const currentZoomFactor = ref(null)

onMounted(async () => {
    webviewElement = document.querySelector("#web-browser-container").appendChild(document.createElement('webview'))
    await nextTick()
    webviewElement.addEventListener("dom-ready", () => {
        watchEffect(() => {
            webviewElement.loadURL(currentSrc.value)
        })
        currentZoomFactor.value = webviewElement.getZoomFactor()
    })
    webviewElement.addEventListener("error", (error) => {
        emitter.emit("showMsg", {
            level: "error",
            msg: "页面出现错误: " + error.message,
            actionButtons: [
                {
                    title: '刷新页面',
                    onClick: () => {
                        refresh()
                    },
                },
                {
                    title: '打开开发者工具查看和调试异常',
                    onClick: () => {
                        toggleDevTools()
                    },
                }
            ]
        })
    })
})

const refresh = () => {
    webviewElement.reload()
    notification.success("页面刷新成功")
}

const back = () => {
    webviewElement.goBack()
}

const forward = () => {
    webviewElement.goForward()
}

const toggleDevTools = () => {
    webviewElement.openDevTools()
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.mainFrame{
}
</style>
