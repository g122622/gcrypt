<template>
    <MonacoEditor height="600" language="typescript" :code="code" :editorOptions="editorOptions" @mounted="editorReady"
        @codeChange="onCodeChange">
    </MonacoEditor>
</template>

<script lang="ts" setup>
// import monacoEditor, { LanguageList, ThemeName, ThemeStore } from "@konghayao/vue-monaco-editor";
import { ref, reactive, onMounted } from "vue";
import File from "@/api/File";
import MonacoEditor from 'vue-monaco-editor'

const code = ref<string>("");
const props = defineProps<{
    file: File
}>()
const editorOptions = {
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

onMounted(async () => {
    code.value = await props.file.read()
});

const editorReady = () => {
    console.log("编辑器准备完成");
};

const onCodeChange = (evt) => {
    console.log(evt);
}
</script>
