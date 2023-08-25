<template>
    <div :id="'AceEditor' + guid" style="position: relative;width: 100%;height: 100%;">
        <v-ace-editor v-model:value="content" @init="onEditorInit" :lang="getExtName(file.filename) ?? 'text'"
            :theme="settingsStore.getSetting('is_dark') ? 'twilight' : 'chrome'" style="height: 100%" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import sharedUtils from "@/utils/sharedUtils"
import { VAceEditor } from 'vue3-ace-editor';
import File from "@/api/File";
import getExtName from "@/utils/getExtName";
import { useSettingsStore } from "@/store/settings"

const settingsStore = useSettingsStore()
const guid = sharedUtils.getHash(10)
const content = ref("")
const props = defineProps<{
    file: File
}>()

onMounted(async () => {
    content.value = (await props.file.read()).toString()
    watch(content, (newVal) => {
        props.file.write(newVal)
    })
})

const onEditorInit = () => {
    console.log("inited")
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
