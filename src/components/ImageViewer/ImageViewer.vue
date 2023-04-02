<template>
    <v-main>
        <div id="viewer-wrapper">
            <viewer :options="options" rebuild>
                <div v-for="(item, index) in props.images" :key="index" class="image-wrapper">
                    <img class="image" :src="item.src">
                </div>
            </viewer>
        </div>
    </v-main>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import 'viewerjs/dist/viewer.css'

interface Props {
    images: Array<{
        src: string
    }>
}
const props = defineProps<Props>()

const options = {
    inline: true,
    button: true,
    navbar: true,
    title: true,
    toolbar: true,
    tooltip: true,
    movable: true,
    zoomable: true,
    rotatable: true,
    scalable: true,
    transition: true,
    fullscreen: true,
    keyboard: true,
    url: 'data-source',
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
