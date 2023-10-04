<template>
    <DialogGenerator height="690px" width="470px" v-model:isDialogOpen="item.isDialogOpen" :title="'选择日期'"
        :isPersistent="true" useCompactContentOuterMargin v-for="item in datePickers" :key="item.taskId">
        <template #mainContent>
            <!-- 时间选择器 -->
            <v-date-picker color="primary" show-adjacent-months show-week v-model="item.selectedDate"
                @click:save="item.confirmHandler(item.selectedDate)" @click:cancel="item.cancellHandler()"></v-date-picker>
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import emitter from "@/eventBus"
import notification from '@/api/notification';

const datePickers = ref<{
    isDialogOpen: boolean,
    selectedDate: string[], // 实际上v-model的结果是单个Date对象，但是vuetify的类型声明文件有bug（标注的是any[]），所以只能写成string[]来通过类型检查
    confirmHandler(selectedDate: string[]): void,
    cancellHandler(): void,
    taskId: string
}[]>([])

emitter.on("Action::openDatePicker", async ({ taskId }) => {
    datePickers.value.push({
        isDialogOpen: true,
        selectedDate: null,
        taskId,
        confirmHandler: (selectedDate) => {
            if (!selectedDate || selectedDate?.length === 0) {
                notification.error("你还没有选择日期")
                return
            }
            emitter.emit("Action::datePicked" + taskId, selectedDate)
            emitter.off("Action::datePicked" + taskId)
            datePickers.value.find(item => item.taskId === taskId).isDialogOpen = false
        },
        cancellHandler: () => {
            emitter.emit("Action::datePickerCancelled" + taskId)
            emitter.off("Action::datePickerCancelled" + taskId)
            datePickers.value.find(item => item.taskId === taskId).isDialogOpen = false
        }
    })
})

onUnmounted(() => {
    emitter.off("Action::openDatePicker")
})
</script>

<style lang="less" scoped></style>
