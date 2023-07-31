<template>
    <div style="position: fixed;" :style="{ filter: `blur(${imgBlur}px)` }">
        <v-img :aspect-ratio="backgroundImgAspectRatio" :width="backgroundImgWidth" :src="imgSrc" cover
            v-if="props.finishLoading"></v-img>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
// import { debounce } from "lodash"
import { useSettingsStore } from "@/store/settings"
const settingsStore = useSettingsStore()

const backgroundImgWidth = ref(0)
const backgroundImgAspectRatio = ref(1)
const imgSrc = computed(() => {
    return settingsStore.getSetting('background_img')
})
const props = defineProps(["finishLoading"])

const imgBlur = computed(() => {
    return Number(settingsStore.settings.find((item) => item.name === "background_img_blur").value) / 10
})

const updateSize = () => {
    backgroundImgWidth.value = document.body.offsetWidth
    backgroundImgAspectRatio.value = document.body.offsetWidth / window.innerHeight
}

window.addEventListener("resize", updateSize)

onMounted(() => {
    updateSize()
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
