<template>
    <DialogGenerator title="选择打开方式" v-model:isDialogOpen="isShowing" width="650px" :isPersistent="true"
        :bottomActions="[{ text: '取消', onClick: () => { isShowing = false } }]">
        <template #mainContent>
            <!-- <v-list lines="two">
                <v-list-item v-for="item in methodsList" :key="item.name" :title="item.name"
                    :subtitle="item.fileType.toString()" @click="onItemClick(item)">
                    <template #prepend>
                        <v-avatar color="grey-lighten-1">
                            <v-icon color="white">{{ item.icon }}</v-icon>
                        </v-avatar>
                    </template>
</v-list-item>
</v-list> -->
            <AdvancedList density="compact" :items="methodsList" empty-tip="暂无找到的打开方式">
                <div class="method-item" v-for="item in methodsList" :key="item.name" @click="onItemClick(item)"
                    v-ripple>
                    <v-icon color="white">{{ item.icon }}</v-icon>
                    <div style="max-width: 110px;">
                        <div class="method-item-header">
                            {{ item.name }}
                        </div>
                        <div class="method-item-tags">
                            <v-chip v-for="fileType in item.fileType" :key="fileType" color="primary" size="x-small"
                                style="margin: 1px;">
                                {{ fileType }}
                            </v-chip>
                        </div>
                    </div>
                </div>
            </AdvancedList>
            <a class="text-blue text-decoration-none" v-if="!isShowingAllMethods" @click="isShowingAllMethods = true"
                style="">
                显示所有
                <v-icon icon="mdi-chevron-down"></v-icon>
            </a>
        </template>
        <template #footer>
            <v-switch v-model="isRememberMethod" color="primary" density="compact"
                :label="`下次仍然用这种方式打开 .${fileType} 文件`"
                style="margin-left: 15px; margin-bottom: -20px; margin-right:-15px" />
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
// 这个组件只负责UI，逻辑交给OpenMethodMgr去处理
import { ref, computed, onMounted } from "vue"
import OpenMethodMgr from "@/api/OpenMethodMgr"
import emitter from "@/eventBus"
import File from "@/api/File"
import { useSettingsStore } from "@/store/settings"
import registerBulitinOpenMethods from "@/api/registerBuiltinOpenMethods"
import AdvancedList from "../shared/AdvancedList.vue"

const store = useSettingsStore()
const fileType = ref<string>('')
const isShowing = ref<boolean>(false)
const isRememberMethod = ref<boolean>(false)
const isShowingAllMethods = ref<boolean>(false)
const openMethodMgr = new OpenMethodMgr()
let currentFile: File = null
let currentExtra = null

const appointedFileOpenMethods = computed(() => {
    return JSON.parse(store.getSetting("appointed_file_open_methods"))
})

// 用于显示的列表
const methodsList = computed(() => {
    if (isShowingAllMethods.value) {
        return openMethodMgr.getMatchedMethod("")
    } else {
        return openMethodMgr.getMatchedMethod(fileType.value)
    }
})

// 设置记住的打开方式
const setAppointedMethod = (ft, nm) => {
    appointedFileOpenMethods.value[ft] = nm
    store.setSetting("appointed_file_open_methods", JSON.stringify(appointedFileOpenMethods.value))
}

// 每个item的点击事件handler
const onItemClick = (item) => {
    if (isRememberMethod.value) {
        setAppointedMethod(fileType.value, item.name)
    }
    item.onSelected(currentFile, currentExtra)
    isShowing.value = false
}

onMounted(() => {
    // 注册内置方法
    registerBulitinOpenMethods(openMethodMgr)

    emitter.on("openFile", ({ fileTypeArg, fileArg, extraArg }) => {
        currentFile = fileArg
        currentExtra = extraArg
        fileType.value = fileTypeArg
        isRememberMethod.value = false
        isShowingAllMethods.value = false
        if (Object.hasOwn(appointedFileOpenMethods.value, fileTypeArg)) {
            const name = appointedFileOpenMethods.value[fileTypeArg]
            openMethodMgr.getMethodByName(name).onSelected(currentFile, currentExtra)
        } else {
            isShowing.value = true
        }
    })
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.method-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;

    width: 180px;
    height: 100px;
    float: left;
    margin: 7px;
    background-color: rgb(25, 25, 25);
    border-radius: 10px;
    padding: 15px;
}

.method-item-header {
    font-size: 16px;
}
</style>
