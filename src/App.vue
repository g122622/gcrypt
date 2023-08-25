<template>
    <BackgroundImg :finishLoading="finishLoading" />
    <div style="position: fixed;width: 100%;height: 100%;z-index: 100000;pointer-events: none;">
        <!-- 弹出消息顶层容器 -->
        <MsgContainer />
        <NotificationManager />
    </div>
    <!-- 右键菜单全局绘制区域 -->
    <ContextMenuGlobalRenderArea />
    <!-- AppLocker -->
    <AppLocker />
    <!-- 打开方式管理器 -->
    <OpenMethodSelector />
    <!-- 本次更新内容对话框 -->
    <PostUpdateInfo />
    <!-- 动态对话框 -->
    <DialogGenerator v-for="item in dialogStore.dialogs" :key="item.guid" v-bind="item"></DialogGenerator>
    <!-- 内置文件选择器 -->
    <Suspense>
        <BuiltinFilePicker></BuiltinFilePicker>
    </Suspense>

    <div :style="{ opacity: backgroundOpacity }">
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
                        <component :is="Component" :key="route.fullPath" />
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
import { useRoute } from 'vue-router'
import hexToRGB from "@/utils/hexToRGB"
import { useDialogStore } from "@/store/dialog";

// 组件
import MsgContainer from "./components/Msg/MsgContainer.vue"
import BackgroundImg from "./components/BackgroundImg.vue"
import NotificationManager from "./components/AdvancedNotification/NotificationManager.vue";
import ContextMenuGlobalRenderArea from "./components/ContextMenuGlobalRenderArea.vue"
import SystemBar from "./components/SystemBar.vue"
import OpenMethodSelector from './components/Dialogs/OpenMethodSelector.vue';
import SideColumn from "./components/SideColumn.vue";
import PostUpdateInfo from './components/Dialogs/PostUpdateInfo.vue'
import DialogGenerator from './components/shared/DialogGenerator.vue'
import AppLocker from './components/AppLocker.vue'
import BuiltinFilePicker from './components/BuiltinFilePicker.vue'

const settingsStore = useSettingsStore()
const mainStore = useMainStore()
const dialogStore = useDialogStore()
const route = useRoute()
const finishLoading = ref<boolean>(false)

const backgroundOpacity = computed(() => {
    let foo = Number(settingsStore.getSetting("background_img_transp")) / 100
    return foo >= 1 ? 0.99999 : foo
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
    scroll-behavior: smooth;
    user-select: none;
}

.v-theme--DarkTheme {
    --v-theme-primary: v-bind('hexToRGB(settingsStore.getSetting("theme_color"))') !important;
}
</style>
