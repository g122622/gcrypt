<template>
    <v-navigation-drawer v-model="isSideDrawerOpen" :rail="isSideDrawerRail" permanent @click="isSideDrawerRail = false"
        width="200">
        <v-list-item prepend-avatar="./assets/avatar-ss.jpg" title="g122622" nav
            @click.stop="isSideDrawerRail = !isSideDrawerRail">
        </v-list-item>
        <v-divider></v-divider>
        <!-- 静态标签页 -->
        <v-list density="compact" nav :items="sideColumnMainItems" @click:select="(value) => {
                handleNavClick(value.id as string);
            }">
        </v-list>
        <v-divider></v-divider>
        <!-- 标签页管理器 -->
        <TabsMgr />

        <!-- 底部容器 -->
        <div id="bottom-container">
            <!-- 性能监视器 -->
            <PerformanceMonitor />
            <!-- 文件状态管理 -->
            <FileStateManager />
        </div>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import PerformanceMonitor from "@/components/PerformanceMonitor/PerformanceMonitor.vue";
import TabsMgr from '@/components/TabsMgr.vue';
import FileStateManager from "@/components/FileStateManager.vue";
import { useRouter } from 'vue-router';

const router = useRouter()
const isSideDrawerOpen = ref<boolean>(true)
const isSideDrawerRail = ref<boolean>(true)

const sideColumnMainItems =
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

const handleNavClick = (value: string) => {
    router.push(`/${value}`)
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#bottom-container {
    position: absolute;
    bottom: 15px;
    width: 100%;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
}
</style>
