<template>
    <DialogGenerator height="500px" width="720px" v-model:isDialogOpen="item.isDialogOpen"
        :title="item.fileMgrOptions.onlyAllowFolderSelection ? '选择文件夹' : '选择文件'" :isPersistent="true"
        useCompactContentOuterMargin v-for="item in filePickers" :key="item.taskId">
        <template #title>
            <div style="margin-left: 7px; width: 150px;">
                <v-select density="compact" label="选择盘符" clearable :items="allDrive.map(i => i.drive).sort()"
                    v-model="item.currentDrive"></v-select>
            </div>
            <v-spacer></v-spacer>
            <v-btn color="primary" style="margin-right: 10px;" @click="item.cancellHandler()">取消</v-btn>
            <v-btn color="primary" @click="item.confirmHandler(item.selectedItems, item.adapter)"
                prepend-icon="mdi-check">确定</v-btn>
        </template>
        <template #mainContent>
            <FileMgr :adapter="item.adapter" height="300px" :options="item.fileMgrOptions"
                v-model:selectedItems="item.selectedItems"
                :directory="item.currentDrive ? newAddr(item.currentDrive) : null">
            </FileMgr>
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import FileMgr from '@/components/FileMgr/FileMgr.vue'
import emitter from "@/eventBus"
import Adapter from "@/api/core/adapters/localFiles/adapter"
import { FileMgrOptions } from '@/components/FileMgr/types/FileMgrOptions';
import dirSingleItem from '@/api/core/types/dirSingleItem';
import path from 'path'
import notification from '@/api/notification';
import getAllDrive from '@/utils/file/getAllDrive'
import Addr from '@/api/core/common/Addr';

const filePickers = ref<{
    isDialogOpen: boolean,
    currentDrive: string
    adapter: Adapter,
    selectedItems: Set<dirSingleItem>,
    fileMgrOptions: FileMgrOptions,
    taskId: string,
    confirmHandler(selectedItems: Set<dirSingleItem>, adapter: Adapter): void,
    cancellHandler(): void
}[]>([])
const allDrive = await getAllDrive()

// vue有一个在template内使用new关键字的bug，see https://github.com/vuejs/core/issues/6483
const newAddr = (drive: string) => {
    return new Addr(`${drive}:/`)
}

emitter.on("Action::openFilePicker", async ({ directory, taskId, onlyAllowFolderSelection, allowMultipleSelection }) => {
    const adapter = new Adapter()
    await adapter.initAdapter(directory ?? "/")
    filePickers.value.push({
        isDialogOpen: true,
        adapter,
        currentDrive: null,
        selectedItems: new Set(),
        fileMgrOptions: {
            useCtxMenu: true,
            useThumbnails: false,
            exposeSelection: true,
            onlyAllowFolderSelection,
            allowMultipleSelection,
            allowSavingViewOptions: false
        },
        taskId,
        confirmHandler: (selectedItems, adapter) => {
            if (selectedItems.size === 0) {
                notification.error("你还没有选择文件")
                return
            }
            const result = []
            selectedItems.forEach(item => {
                result.push(path.join(adapter.getCurrentDirectory().toPathStr(), item.name))
            })
            emitter.emit("Action::filePicked" + taskId, result)
            emitter.off("Action::filePicked" + taskId)
            filePickers.value.find(item => item.taskId === taskId).isDialogOpen = false
        },
        cancellHandler: () => {
            emitter.emit("Action::filePickerCancelled" + taskId)
            emitter.off("Action::filePickerCancelled" + taskId)
            filePickers.value.find(item => item.taskId === taskId).isDialogOpen = false
        }
    })
})

onUnmounted(() => {
    emitter.off("Action::openFilePicker")
})
</script>

<style lang="less" scoped></style>
