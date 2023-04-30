<template>
    <DialogGenerator title="选择打开方式" v-model:isDialogOpen="isShowing">
        <template #mainContent>
            <v-list lines="two">
                <v-list-item v-for="item in methodsList" :key="item.name" :title="item.name"
                    :subtitle="item.fileType.toString()" @click="item.onSelected(data)">
                    <template v-slot:prepend>
                        <v-avatar color="grey-lighten-1">
                            <v-icon color="white">{{ item.icon }}</v-icon>
                        </v-avatar>
                    </template>
                </v-list-item>
            </v-list>
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import OpenMethodMgr from "@/api/OpenMethodMgr"
import emitter from "@/eventBus"

const fileType = ref<string>('')
const isShowing = ref<boolean>(false)
let data = 'www.baidu.com'
const methodsList = computed(() => {
    return OpenMethodMgr.getMatchedMethod(fileType.value)
})

onMounted(() => {
    emitter.on("openFile", ({ fileTypeArg, dataArg }) => {
        isShowing.value = true
        fileType.value = fileTypeArg
        data = dataArg
    })
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
