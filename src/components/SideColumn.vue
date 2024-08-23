<template>
    <v-navigation-drawer :rail="isSideDrawerRail" permanent width="200">
        <v-list-item nav @click.stop="isSideDrawerRail = !isSideDrawerRail">
            <template #prepend>
                <IconBtn icon="mdi-chevron-right" size="small"
                    :style="{ transform: isSideDrawerRail ? 'rotate(0turn)' : 'rotate(0.5turn)' }"></IconBtn>
            </template>
        </v-list-item>
        <v-divider></v-divider>
        <!-- 静态标签页 -->
        <v-list density="compact" nav :items="sideColumnMainItems" @click:select="(value) => {
            handleNavClick(value.id as string);
        }" :selected="[route.name]">
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
            <!-- 任务管理器 -->
            <TaskMgr />
        </div>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from "vue"
import PerformanceMonitor from "@/components/PerformanceMonitor/PerformanceMonitor.vue";
import TabsMgr from '@/components/TabsMgr.vue';
import TaskMgr from "./TaskMgr.vue";
import FileStateManager from "@/components/FileStateManager.vue";
import { useRouter, useRoute } from 'vue-router';
import { useSettingsStore } from "@/store/settings"

const settingsStore = useSettingsStore()
const router = useRouter()
const route = useRoute()
const isSideDrawerRail = ref<boolean>(!settingsStore.getSetting("side_column_open_by_default"))

const sideColumnMainItems =
    [
        {
            title: '加密库',
            props: {
                prependIcon: 'mdi-lock',
            },
            value: "store"
        },
        {
            title: '文件管理',
            props: {
                prependIcon: 'mdi-file',
            },
            value: "side_column_local_file"
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

const handleNavClick = async (value: string) => {
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
    flex-wrap: wrap;
}

hr {
    width: 70%;
    margin: 5px auto 5px auto;
}
</style>

<style>
.v-theme--LightTheme {
    .v-navigation-drawer {
        border: none;
        box-shadow: 0px 0px 2px 1px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.15));
    }
}

.v-theme--DarkTheme {
    .v-navigation-drawer {
        border: none;
        /* box-shadow: 0px 2px 4px -1px var(--v-shadow-key-umbra-opacity, rgba(0, 0, 0, 0.2)), 0px 4px 5px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.14)), 0px 1px 10px 0px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.12)); */
        box-shadow: 0px 0px 7px 5px var(--v-shadow-key-penumbra-opacity, rgba(0, 0, 0, 0.25));
    }
}
</style>
