<template>
    <div style="position: fixed;" :style="{ filter: `blur(${imgBlur}px)` }">
        <v-img :aspect-ratio="backgroundImgAspectRatio" :width="backgroundImgWidth" :src="imgSrc" cover
            v-if="props.finishLoading"></v-img>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import emitter from "@/eventBus"
import { useMainStore } from "@/store"
const store = useMainStore()

const backgroundImgWidth = ref(0)
const backgroundImgAspectRatio = ref(1)
const imgSrc = ref("")
const props = defineProps(["finishLoading"])

const imgBlur = computed(() => {
    return Number(store.settings.find((item) => item.name === "background_img_blur").value) / 10
})

const updateSize = () => {
    backgroundImgWidth.value = document.body.offsetWidth
    backgroundImgAspectRatio.value = document.body.offsetWidth / window.innerHeight
}

window.onresize = updateSize

onMounted(() => {
    imgSrc.value = store.settings.filter((a) => { return a.name === "background_img" })[0].value as string
    updateSize()
    emitter.on("updateSettings", () => {
        imgSrc.value = store.settings.filter((a) => { return a.name === "background_img" })[0].value as string
    })
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
