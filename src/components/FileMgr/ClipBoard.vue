<template>
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" size="x-small" variant="plain">
                <v-icon>mdi-clipboard-list</v-icon>
                <v-tooltip activator="parent" location="bottom">剪贴板</v-tooltip>
            </v-btn>
        </template>
        <v-card>
            <AdvancedList density="compact" height="300px" :use-bottom-tip="true" :use-search="true" subheader="剪贴板"
                width="400px" empty-tip="剪贴板为空" :items="clipBoardItems" v-slot="{ matchedItems }">
                <v-list-item v-for="item in matchedItems" :key="item.srcAddr.toPathStr()"
                    :title="item.srcAddr.toPathStr() + item.filename">
                    <template #prepend>
                        <v-chip variant="flat" color="blue" size="small" style="margin-right: 10px;">
                            {{ item.method }}
                        </v-chip>
                    </template>
                    <template #append>
                        <IconBtn icon="mdi-clipboard-arrow-right-outline" tooltip="复制或移动到当前目录" size="small"
                            @click="handleAction(item)" />
                    </template>
                </v-list-item>
            </AdvancedList>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AdvancedList from "@/components/shared/AdvancedList.vue"
import AdapterBase from "@/api/core/types/AdapterBase";
import { ClipBoardItem } from "./types/ClipBoardItem";
import Addr from "@/api/core/common/Addr";
import { useTaskStore } from "@/store/task";
import Task from "@/api/Task";
import DirSingleItem from "@/api/core/types/DirSingleItem";
import lodash from "lodash";
import notification from "@/api/notification";

interface Props {
    adapter: AdapterBase,
    currentDir: Addr,
    selectedItems: Set<DirSingleItem>
}
const props = defineProps<Props>()
const clipBoardItems = ref<ClipBoardItem[]>([])
const taskStore = useTaskStore()

const addFileItemToClipBoard = (filename: string, srcAddr: Addr, method: ClipBoardItem['method']) => {
    clipBoardItems.value.push({ filename, srcAddr, method })
}

const addSelectedItemsToClipBoard = (method: ClipBoardItem['method']) => {
    props.selectedItems.forEach((val) => {
        // name是字符串，传的是拷贝不是引用，无需克隆
        addFileItemToClipBoard(val.name, lodash.cloneDeep(props.currentDir), method)
    })
}

const handleAction = (arg: ClipBoardItem) => {
    if (arg.method === 'copy') {
        taskStore.addTask(new Task(async () => {
            if (props.adapter.copyFile) {
                await props.adapter.copyFile(arg.filename, arg.srcAddr, props.currentDir)
            } else {
                const buf = await props.adapter.readFile(arg.filename, arg.srcAddr)
                await props.adapter.writeFile(arg.filename, buf, props.currentDir)
            }
        }, { name: `复制文件 ${arg.filename}` }), { runImmediately: true })
    } else if (arg.method === 'move') {
        taskStore.addTask(new Task(async () => {
            if (props.adapter.moveFile) {
                await props.adapter.moveFile(arg.filename, arg.srcAddr, props.currentDir)
            } else {
                const buf = await props.adapter.readFile(arg.filename, arg.srcAddr)
                await props.adapter.writeFile(arg.filename, buf, props.currentDir)
                await props.adapter.deleteFile(arg.filename, arg.srcAddr)
            }
            clipBoardItems.value.splice(clipBoardItems.value.findIndex(item => item === arg), 1)
        }, { name: `移动文件 ${arg.filename}` }), { runImmediately: true })
    } else if (arg.method === 'symlink') {
        taskStore.addTask(new Task(async () => {
            if (props.adapter.createSymlink) {
                await props.adapter.createSymlink(arg.filename, arg.srcAddr, props.currentDir)
            } else {
                notification.error("adapter不支持符号链接")
                throw new Error()
            }
        }, { name: `创建符号链接 ${arg.filename}` }), { runImmediately: true })
    }
}

defineExpose({ addSelectedItemsToClipBoard })

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
