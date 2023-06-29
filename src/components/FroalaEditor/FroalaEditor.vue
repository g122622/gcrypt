<template>
    <div id="FroalaEditor-wrapper">
        <div :id="'FroalaEditor' + guid"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import sharedUtils from "@/utils/sharedUtils"
import File from "@/api/File";
import sleep from "@/utils/sleep";
import { useSettingsStore } from "@/store/settings";

const settingsStore = useSettingsStore()
const props = defineProps<{
    file: File
}>()
const guid = sharedUtils.getHash(10)

onMounted(async () => {
    console.log(settingsStore.getSetting("is_dark"))
    // 创建editor实例
    // eslint-disable-next-line no-undef
    const FroalaEditorInstance = new FroalaEditor('#FroalaEditor' + guid, {
        events: {
            contentChanged: async function () {
                await props.file.write(Buffer.from(this.html.get(true)))
            }
        },
        theme: settingsStore.getSetting("is_dark") ? "dark" : "royal"
    })
    await sleep(1000)
    FroalaEditorInstance.html.set((await props.file.read()).toString())
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#FroalaEditor-wrapper {
    height: calc(100% - 10px);
    margin: 5px;
}
</style>
