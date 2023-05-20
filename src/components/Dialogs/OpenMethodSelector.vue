<template>
    <DialogGenerator title="选择打开方式" v-model:isDialogOpen="isShowing" height="600px" width="350px" :isPersistent="true"
        :bottomActions="[{ text: '取消', onClick: () => { isShowing = false } }]">
        <template #mainContent>
            <v-list lines="two">
                <v-list-item v-for="item in methodsList" :key="item.name" :title="item.name"
                    :subtitle="item.fileType.toString()" @click="onItemClick(item)">
                    <template #prepend>
                        <v-avatar color="grey-lighten-1">
                            <v-icon color="white">{{ item.icon }}</v-icon>
                        </v-avatar>
                    </template>
                </v-list-item>
            </v-list>
        </template>
        <template #footer>
            下次仍然用这种方式打开
            <v-switch v-model="isRememberMethod" color="primary" density="compact" />
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
// 这个组件只负责UI，逻辑交给OpenMethodMgr去处理
import { ref, computed, onMounted } from "vue"
import OpenMethodMgr from "@/api/OpenMethodMgr"
import emitter from "@/eventBus"
import File from "@/api/File"
import { useMainStore } from "@/store"
import registerBulitinOpenMethods from "@/api/registerBuiltinOpenMethods"

const store = useMainStore()
const fileType = ref<string>('')
const isShowing = ref<boolean>(false)
const isRememberMethod = ref<boolean>(false)
const openMethodMgr = new OpenMethodMgr()
// const appointedFileOpenMethods = store.getSetting("appointed_file_open_methods")
let currentFile: File = null
let currentExtra = null

const appointedFileOpenMethods = computed({
    get() {
        return JSON.parse(store.getSetting("appointed_file_open_methods"))
    },
    set(newVal) {
        store.setSetting("appointed_file_open_methods", JSON.stringify(newVal))
    }
})

// 用于显示的列表
const methodsList = computed(() => {
    return openMethodMgr.getMatchedMethod(fileType.value)
})

// 设置记住的打开方式
const setAppointedMethod = (ft, nm) => {
    // store.setSetting("appointed_file_open_methods",)
    appointedFileOpenMethods.value[ft] = nm
}

// 每个item的点击事件handler
const onItemClick = (item) => {
    if (isRememberMethod.value) {
        setAppointedMethod(fileType.value, item.name)
    }
    item.onSelected(currentFile, currentExtra)
}

onMounted(() => {
    // 注册内置方法
    registerBulitinOpenMethods(openMethodMgr)

    emitter.on("openFile", ({ fileTypeArg, fileArg, extraArg }) => {
        currentFile = fileArg
        currentExtra = extraArg
        fileType.value = fileTypeArg
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
<style scoped lang="less"></style>
