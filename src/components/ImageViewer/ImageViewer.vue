<template>
    <v-main>
        <!--         <div><ul id="viewer-container">
                <li v-for="(item, index) in props.images" :key="index" class="image-wrapper">
                    <img :src="item.src">
                </li>
            </ul></div> -->

        <div id="viewer-container">
            <img :src="images[0].src" id="view-img">
        </div>

    </v-main>
</template>

<script setup lang="ts">
// import { onMounted } from "vue"
// import { ref, onMounted, nextTick, onUnmounted } from "vue"
// import Viewer from 'viewerjs';
// import 'viewerjs/dist/viewer.css'

// const loading = ref<boolean>(true)
// let viewer: Viewer = null
// interface Props {
    images: Array<{
        src: string
    }>
}
// const props = defineProps<Props>()

/* const options = {
    inline: false,
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
    viewed() {
        viewer.zoomTo(1);
    },
}

onMounted(async () => {
    viewer = new Viewer(document.getElementById('view-img'), {
        ...options
    })
    viewer.show()
    loading.value = false
})
onUnmounted(async () => {
    viewer.destroy()
})

*/
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
