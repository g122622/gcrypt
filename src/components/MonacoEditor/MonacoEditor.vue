<template>
    <monaco-editor v-model="code" style="flex:1" :language="selectedLanguage" :theme="selectedTheme" @ready="editorReady">
    </monaco-editor>
</template>

<script lang="ts" setup>
import monacoEditor, { LanguageList, ThemeName, ThemeStore } from "@konghayao/vue-monaco-editor";
import { ref, reactive, onMounted } from "vue";
const code = ref("");
const ThemeNames = ref([]);
const selectedTheme = ref<ThemeName>("github-gist");
const selectedLanguage = ref<LanguageList>("json");
const Languages = ref([]);

onMounted(() => {
    fetch(
        "https://cdn.jsdelivr.net/npm/@konghayao/promise-transaction/src/index.js"
    )
        .then((res) => res.text())
        .then((Code) => (code.value = Code));
    console.log("代码载入");
});

const editorReady = () => {
    console.log("编辑器准备完成");
    // 只有当编辑器完成之后才会自动加载这些数据
    ThemeNames.value = Object.keys(ThemeStore);
    Languages.value = window.monaco.languages.getLanguages().map((i) => i.id);

    selectedLanguage.value = "typescript";
    selectedTheme.value = "github-gist";
};
</script>
