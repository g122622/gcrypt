<template>
    <!-- <img id="background_img" style="position: absolute;width: 100%;height: 100%;overflow: hidden;" /> -->
    <BackgroundImg :finishLoading="finishLoading" ref="BackgroundImg"></BackgroundImg>
    <div style="position: fixed;width: 100%;height: 100%;z-index: 999999999999;pointer-events: none;">
        <!-- 弹出消息顶层容器 -->
        <MsgContainer></MsgContainer>
        <NotificationManager />
    </div>
    <div :style="{ opacity: imgOpacity }">
        <v-app>
            <!-- 顶部系统状态栏 -->
            <v-system-bar window style="-webkit-app-region: drag;" height="33">
                <span class="ml-2">隐域-Gcrypt</span>
                <v-spacer></v-spacer>
            </v-system-bar>

            <!-- 左侧导航栏 -->
            <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false" width="150">
                <v-list-item prepend-avatar="./assets/avatar-s.jpg" title="Aimerez" nav>
                    <template v-slot:append>
                        <v-btn variant="text" icon="mdi-chevron-left" @click.stop="rail = !rail"></v-btn>
                    </template>
                </v-list-item>

                <v-divider></v-divider>

                <v-list density="compact" nav :items="items" @click:select="(value) => {
                    this.handleNavClick(value.id);
                }">
                </v-list>
            </v-navigation-drawer>

            <!-- 顶部工具栏 -->
            <div id="ActionToolBar">
            </div>
            <!-- router主内容区 -->
            <v-main :scrollable="this.$store.mainContentScrollable">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </v-main>

        </v-app>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import emitter from './eventBus'
import MsgContainer from "./components/Msg/MsgContainer.vue"
import BackgroundImg from "./components/BackgroundImg.vue"
import NotificationManager from "./components/AdvancedNotification/NotificationManager.vue";

export default defineComponent({
    name: 'App',
    components: {
        MsgContainer,
        BackgroundImg,
        NotificationManager
    },
    data() {
        return {
            drawer: true,
            items: [
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
            ],
            rail: true,
            finishLoading: false
        }
    },

    setup() {
        // const theme = useTheme()
        // theme.global.name.value = F'dark'
        // return theme
    },
    methods: {
        handleNavClick(value: string): void {
            this.$router.push(`/${value}`)
        }
    },
    mounted() {
        this.$store.mainContentScrollable = true
        window.addEventListener('error', function (event) {
            // onerror_statements
            const str = `主窗口渲染进程发生代码执行错误，错误栈消息如下：${event.error.stack}`
            emitter.emit('showMsg', { level: "error", msg: str });
        })

        this.finishLoading = true
        window.onresize = () => {
            this.$refs.BackgroundImg.$forceUpdate()
        }
        document.querySelectorAll("#app")[0].setAttribute("data-theme-type", "dark")
    },
    computed: {
        imgOpacity() {
            let foo = this.$store.getters.settings.filter((item) => { return item.name === "background_img_transp" })[0].value / 100
            if (foo >= 1) {
                foo = 0.99999
            }
            return foo
        }
    }
})
</script>

<style lang="less">
@import url('./styles/globalVariables.less');

::-webkit-scrollbar {
    width: 12px;
    height: 12px;
    position: absolute;
}

/* 正常情况下滑块的样式 */
::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;

}

/* 鼠标悬浮在该类指向的控件上时滑块的样式 */
:hover::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
}

/* 鼠标悬浮在滑块上时滑块的样式 */
::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
}

/* 正常时候的主干部分 */
::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0);
}

/* 鼠标悬浮在滚动条上的主干部分 */
::-webkit-scrollbar-track:hover {
    background-color: rgba(0, 0, 0, 0);
}

html {
    width: 100%;
    overflow: hidden !important;
}
</style>
