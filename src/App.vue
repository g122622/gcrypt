<template>
    <BackgroundImg :finishLoading="finishLoading" />
    <div style="position: fixed;width: 100%;height: 100%;z-index: 1000000;pointer-events: none;">
        <!-- 弹出消息顶层容器 -->
        <MsgContainer />
        <NotificationManager />
    </div>
    <ContextMenuGlobalRenderArea />
    
    <div :style="{ opacity: imgOpacity }">
        <v-app>
            <!-- 顶部系统状态栏 -->
            <v-system-bar window style="-webkit-app-region: drag;" height="33">
                <span class="ml-2">隐域-Gcrypt</span>
                <v-spacer />
            </v-system-bar>

            <!-- 左侧导航栏 -->
            <v-navigation-drawer v-model="isSideDrawerOpen" :rail="isSideDrawerRail" permanent
                @click="isSideDrawerRail = false" width="200">
                <v-list-item prepend-avatar="./assets/avatar-ss.jpg" title="g122622" nav
                    @click.stop="isSideDrawerRail = !isSideDrawerRail">
                </v-list-item>
                <v-divider></v-divider>
                <!-- 静态标签页 -->
                <v-list density="compact" nav :items="sidebarMainItems" @click:select="(value) => {
                    handleNavClick(value.id);
                }">
                </v-list>
                <v-divider></v-divider>
                <!-- 动态标签页 -->
                TODO vuetify折叠组件
                <v-list density="compact" nav>
                    <v-list-item v-for="item in dynamicTabs" title="item.name"
                        @click:select="item.handleClick()">
                        <template #prepend>
                            <v-icon>
                                {{item.icon}}
                            </v-icon>
                        </template>
                        <template #append>
                            <IconBtn
                                size="small"
                                icon="mdi-close"
                                tooltip:"关闭标签页"
                                onClick="item.handleClose()"
                                />
                        </template>
                    </v-list-item>
                </v-list>

                <v-spacer/>
                <!-- 性能监视器 -->
                <PerformanceMonitor />

            </v-navigation-drawer>

            <!-- 顶部工具栏 -->
            <div id="ActionToolBar" />
            <!-- router主内容区 -->
            <v-main :scrollable="store.state.mainContentScrollable">
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
import MsgContainer from "./components/Msg/MsgContainer.vue"
import BackgroundImg from "./components/BackgroundImg.vue"
import NotificationManager from "./components/AdvancedNotification/NotificationManager.vue";
import PerformanceMonitor from "./components/PerformanceMonitor/PerformanceMonitor.vue";
import ContextMenuGlobalRenderArea from "./components/ContextMenuGlobalRenderArea.vue"
import { ref, computed, onMounted, nextTick } from "vue"
import router from "./router"
import store from "./store"

/*
一.事件命名规范:
    1.UI事件 只传达某个UI状态改变的信息
        UI::contextMenu::clickOutside
    2.Action 强调动作
        Action::showMsg
    3.LifeCycle 生命周期事件
        LifeCycle::finishedLoadingApp
        LifeCycle::outOfMem
        LifeCycle::clearMem
*/

const isSideDrawerOpen = ref<boolean>(true)
const isSideDrawerRail = ref<boolean>(true)
const finishLoading = ref<boolean>(false)
const sidebarMainItems =
    [
        {
            title: '主页',
            props: {
                prependIcon: 'mdi-home',
            },
            value: "home"
        },
        {
            title: '加密库',
            props: {
                prependIcon: 'mdi-lock',
            },
            value: "store"
        },
        {
            title: '文件',
            props: {
                prependIcon: 'mdi-folder',
            },
            value: "files"
        },
        {
            title: '设置',
            props: {
                prependIcon: 'mdi-cog',
            },
            value: "settings"
        },
        {
            title: '关于',
            props: {
                prependIcon: 'mdi-information',
            },
            value: "about"
        },
    ]
const dynamicTabs=ref<Array>([])

const handleNavClick = (value: string) => {
    router.push(`/${value}`)
}

const imgOpacity = computed(() => {
    let foo = store.getters.settings.find((item) => { return item.name === "background_img_transp" }).value / 100
    if (foo >= 1) {
        foo = 0.99999
    }
    return foo
})

onMounted(async () => {
    // 是否显示主内容区滚动条
    store.state.mainContentScrollable = true
    // 初始化事件
    emitter.on("UI::addTabItem",({name,icon,onClick,onClose})=>{
        dynamicTabs.value.push({name,icon,
        handleClick:()=>{
            router.push(`/${name}`)
            onClick()
        },
        // 用户可以在onClose函数里面reject掉promise，这样会阻止标签页继续关闭
        handleClose:async()=>{
            if(onClose){
                await Promise.resolve(onClose)()
            }
            emitter.emit("Action::removeTab",{name})
        }
        })
    })
    
    await nextTick()
    finishLoading.value = true
    emitter.emit("LifeCycle::finishedLoadingApp")
})

</script>

<style lang="less">
@import url('./styles/globalVariables.less');
@import url('./styles/globalVuetifyOverrides.less');

@import url('./styles/scrollbars.less');

html {
    width: 100%;
    overflow: hidden !important;
}
</style>