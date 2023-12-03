<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" size="x-small">
                <v-icon>mdi-clipboard-list</v-icon>
                <v-tooltip activator="parent" location="bottom">剪切板</v-tooltip>
            </v-btn>
        </template>
        <v-card>
            <AdvancedList density="compact" height="500px" :use-bottom-tip="true" :use-search="true" subheader="剪切板"
                width="500px" empty-tip="剪切板为空" :items="clipBoardItems" v-slot="{ matchedItems }">
                <v-list-item v-for="item in matchedItems" :key="item.srcAddr.toPathStr()"
                    :title="item.srcAddr.toPathStr() + item.filename">
                    <template #append>
                        <IconBtn icon="mdi-clipboard-arrow-right-outline" tooltip="`复制或移动到当前目录`" size="small"
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
import dirSingleItem from "@/api/core/types/dirSingleItem";
import lodash from "lodash";

interface Props {
    adapter: AdapterBase,
    currentDir: Addr,
    selectedItems: Set<dirSingleItem>
}
const props = defineProps<Props>()
const clipBoardItems = ref<ClipBoardItem[]>([])
const taskStore = useTaskStore()

const addFileItemToClipBoard = (filename: string, srcAddr: Addr, method: 'copy' | 'move') => {
    clipBoardItems.value.push({ filename, srcAddr, method })
}

const addSelectedItemsToClipBoard = (method: 'copy' | 'move') => {
    props.selectedItems.forEach((val) => {
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
        }, `复制文件 ${arg.filename}`), { runImmediately: true })
    }
}

defineExpose({ addSelectedItemsToClipBoard })

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
