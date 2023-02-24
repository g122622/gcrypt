<template>
    <div style="position: fixed;" :style="{ filter: `blur(${imgBlur}px)` }">
        <v-img :aspect-ratio="backgroundImgAspectRatio" :width="backgroundImgWidth" :src="imgSrc" cover
            v-if="finishLoading"></v-img>
    </div>
</template>

<script>
import { defineComponent } from "vue"
import emitter from "../eventBus";

export default defineComponent({
    name: 'BackgroundImg',
    props: {
        finishLoading: Boolean,
    },
    data() {
        return {
            foo: 0,
            imgSrc: ""
        }
    },
    computed: {
        backgroundImgWidth() {
            // 强制依赖收集
            return document.body.offsetWidth + this.foo * 0
        },
        backgroundImgAspectRatio() {
            // 强制依赖收集
            return document.body.offsetWidth / window.innerHeight + this.foo * 0
        },
        imgBlur() {
            return this.$store.getters.settings.filter((item) => { return item.name === "background_img_blur" })[0].value / 10
        }
    },
    beforeUpdate() {
        // 强制触发视图更新
        // eslint-disable-next-line no-self-assign
        this.foo++
    },
    mounted() {
        this.imgSrc = this.$store.getters.settings.filter((a) => { return a.name === "background_img" })[0].value
        emitter.on("updateSettings", () => {
            this.imgSrc = this.$store.getters.settings.filter((a) => { return a.name === "background_img" })[0].value
        })
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
