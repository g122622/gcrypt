<template>
    <BackgroundImg :finishLoading="finishLoading" />
    <div style="position: fixed;width: 100%;height: 100%;z-index: 1000000;pointer-events: none;">
        <!-- 弹出消息顶层容器 -->
        <MsgContainer />
        <NotificationManager />
    </div>
    <ContextMenuGlobalRenderArea />
    <OpenMethodSelector />

    <div :style="{ opacity: imgOpacity }">
        <v-app>
            <!-- 顶部系统状态栏 -->
            <SystemBar />
            <!-- 左侧导航栏 -->
            <SideColumn />

            <!-- 顶部工具栏 -->
            <div id="ActionToolBar" />
            <!-- router主内容区 -->
            <v-main :scrollable="mainStore.mainContentScrollable">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </v-main>

        </v-app>
    </div>
</template>

<script setup lang="ts">
import emitter from './eventBus'
import { ref, computed, onMounted, nextTick } from "vue"
import { useSettingsStore } from "./store/settings"
import { useMainStore } from "./store/main"

// 组件
import MsgContainer from "./components/Msg/MsgContainer.vue"
import BackgroundImg from "./components/BackgroundImg.vue"
import NotificationManager from "./components/AdvancedNotification/NotificationManager.vue";
import ContextMenuGlobalRenderArea from "./components/ContextMenuGlobalRenderArea.vue"
import SystemBar from "./components/SystemBar.vue"
import OpenMethodSelector from './components/Dialogs/OpenMethodSelector.vue';
import SideColumn from "./components/SideColumn.vue";

const settingsStore = useSettingsStore()
const mainStore = useMainStore()
const finishLoading = ref<boolean>(false)

const imgOpacity = computed(() => {
    let foo = Number(settingsStore.settings.find((item) => { return item.name === "background_img_transp" }).value) / 100
    if (foo >= 1) {
        foo = 0.99999
    }
    return foo
})

onMounted(async () => {
    // 是否显示主内容区滚动条
    mainStore.mainContentScrollable = true
    await nextTick()
    finishLoading.value = true
    emitter.emit("LifeCycle::finishedLoadingApp")
})

</script>

<style lang="less">
@import './styles/globalVariables.less';
@import './styles/globalVuetifyOverrides.less';

@import './styles/scrollbars.less';

html {
    width: 100%;
    overflow: hidden !important;
}
</style>
