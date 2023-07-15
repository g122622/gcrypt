<template>
    <div id="FroalaEditor-wrapper">
        <div :id="'FroalaEditor' + guid"></div>
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
let FroalaEditorInstance = null

onMounted(async () => {
    setInterval(async () => {
        console.log(await props.file.read())
    }, 1000)
    // 创建editor实例
    // eslint-disable-next-line no-undef
    FroalaEditorInstance = new FroalaEditor('#FroalaEditor' + guid, {
        events: {
            contentChanged: async function () {
                await props.file.write(this.html.get(true))
            }
        },
        theme: settingsStore.getSetting("is_dark") ? "dark" : "royal",
        spellcheck: false
    })
    await sleep(100)
    FroalaEditorInstance.html.set((await props.file.read()).toString())
})

onBeforeUnmount(() => {
    FroalaEditorInstance?.destroy()
    console.log('FroalaEditor destroyed')
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#FroalaEditor-wrapper {
    height: calc(100% - 10px);
    margin: 5px;
}
</style>
