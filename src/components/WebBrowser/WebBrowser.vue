<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="网页浏览器">
            <template #prepend>
                <v-text-field :modelValue="currentSrc" placeholder="输入网址或本地路径" v-if="!content" />
            </template>
            <IconBtn icon="mdi-refresh" @click="refresh()" tooltip="刷新页面" v-if="!content" />
            <IconBtn icon="mdi-arrow-left" @click="back()" tooltip="后退" v-if="!content" />
            <IconBtn icon="mdi-arrow-right" @click="forward()" tooltip="前进" v-if="!content" />
            <!-- <IconBtn icon="mdi-TODO" @click="toggleDevTools()" tooltip="开发者工具" /> -->
            <!-- TODO <v-radio> -->
        </ActionToolBarBase>
    </Teleport>

    <div id="web-browser-container">
        <iframe ref="webIframe" class="mainFrame" />
    </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted } from "vue"
import emitter from "@/eventBus"
import notification from "@/api/notification";

interface Props {
    src?: string,
    content?: string
}
const props = defineProps<Props>()
const currentSrc = ref<string>(props.src || "")
const webIframe = ref<HTMLIFrameElement>()
const currentZoomFactor = ref(null)

onMounted(async () => {
    watchEffect(() => {
        if (props.src) {
            webIframe.value.contentWindow.location.href = currentSrc.value
        } else if (props.content) {
            webIframe.value.contentWindow.document.write(props.content)
        }
    })
    webIframe.value.addEventListener("dom-ready", () => {
        currentZoomFactor.value = webIframe.value.contentWindow.devicePixelRatio
    })
    webIframe.value.addEventListener("error", (error) => {
        emitter.emit("showMsg", {
            level: "error",
            msg: "页面出现错误: " + error.message,
            actionButtons: [
                {
                    title: '刷新页面',
                    onClick: () => {
                        refresh()
                    },
                }
            ]
        })
    })
})

const refresh = () => {
    webIframe.value.contentWindow.location.reload()
    notification.success("页面刷新成功")
}

const back = () => {
    webIframe.value.contentWindow.history.back()
}

const forward = () => {
    webIframe.value.contentWindow.history.forward()
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.mainFrame {
    width: 100%;
    height: calc(100%-30px);
}
</style>
