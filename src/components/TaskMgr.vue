<template>
    <div class="text-center">
        <v-menu v-model="isMenuOpen" :close-on-content-click="false" location="end">
            <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props" size="small" style="margin-top:10px">
                    <v-icon>
                        mdi-function-variant
                    </v-icon>
                </v-btn>
            </template>

            <v-card width="600" height='400'>
                <!-- 主内容 -->
                <AdvancedList lines="two" :subheader="`任务管理器(${taskStore.taskPool.length})`" :items="taskStore.taskPool"
                    useBottomTip useSearch v-slot="{ matchedItems }" width="590px" height="230px">
                    <v-list-item v-for="item in matchedItems" :key="item.guid" :title="item.name">
                        <template #append>
                            <v-icon color="success" v-if="item.state === 'succeed'">mdi-check-circle</v-icon>
                            <v-icon color="error" v-if="item.state === 'failed'">mdi-close-circle</v-icon>
                            <v-icon v-if="item.state === 'cancelled'">mdi-cancel</v-icon>
                            <v-icon v-if="item.state === 'pending'">mdi-clock-time-eight</v-icon>
                            <v-progress-circular indeterminate color="primary" bg-color="rgba(0,0,0,0)"
                                v-if="item.state === 'running'"></v-progress-circular>
                            <IconBtn icon="mdi-information" :tooltip="getTooltip(item)" size="small" />
                            <IconBtn icon="mdi-close" tooltip="取消该任务" size="small" @click="item.cancell()"
                                :disabled="!item.isCancellable()" />
                        </template>
                    </v-list-item>
                </AdvancedList>
                <v-divider />
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="isMenuOpen = false">
                        退出
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="taskStore.clean()">
                        清理
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { useTaskStore } from "@/store/task"
import Task from "@/api/Task";

const taskStore = useTaskStore()
const isMenuOpen = ref(false)
const getTooltip = (item: Task) => {
    return JSON.stringify(item)
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
