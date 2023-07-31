<template>
    <div class="monaco-editor-container" :id="'monaco-editor-container' + guid">
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import sharedUtils from "@/utils/sharedUtils"
import File from "@/api/File";
import { useSettingsStore } from "@/store/settings";
import sleep from "@/utils/sleep";

const settingsStore = useSettingsStore()
const props = defineProps<{
    file: File
}>()
const guid = sharedUtils.getHash(10)
let MonacoEditorInstance = null

onMounted(() => {
    // eslint-disable-next-line dot-notation
    MonacoEditorInstance = window['monaco'].editor.create(document.querySelector('monaco-editor-container' + guid), {
        value: props.file.read(),
        language: 'json',
        theme: settingsStore.getSetting("is_dark") ? 'vs-dark' : 'vs-light',
        editorOptions: {
            foldingStrategy: 'indentation', // 代码可分小段折叠
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false, // 只读
            cursorStyle: 'line', // 光标样式
            automaticLayout: false, // 自动布局
            glyphMargin: true, // 字形边缘
            useTabStops: false,
            tabSize: 4, // tab 缩进长度
            autoIndent: true // 自动布局
        }
    })

    MonacoEditorInstance.onDidChangeModelContent((event) => {
        props.file.write(MonacoEditorInstance.getValue())
    })
})

onBeforeUnmount(() => {
    MonacoEditorInstance.destroy()
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.monaco-editor-container {
    height: calc(100% - 10px);
    width: auto;
    margin: 5px;
}
</style>
