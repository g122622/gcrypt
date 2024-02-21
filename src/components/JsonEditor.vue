<template>
    <div :id="'JsonEditor' + guid" style="position: relative;width: 100%;height: 100%;">
        <JsonEditorVue v-model="content" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import sharedUtils from "@/utils/sharedUtils"
import File from "@/api/File";
import { useSettingsStore } from "@/store/settings"

const settingsStore = useSettingsStore()
const guid = sharedUtils.getHash(10)
const content = ref("")
const props = defineProps<{
    file: File
}>()

onMounted(async () => {
    content.value = JSON.parse((await props.file.read()).toString())
    watch(content, (newVal) => {
        props.file.write(JSON.stringify(newVal))
    })
})

const onEditorInit = () => {
    console.log("inited")
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
