<template>
    <div id="ContextMenuGlobalRenderArea" @click.left="handleClick"
        :style="{ pointerEvents: (isReceivingPointerEvents ? 'all' : 'none') }" />
</template>

<script setup lang="ts">
import emitter from "@/eventBus"
import { ref, onMounted } from "vue"

const isReceivingPointerEvents = ref<boolean>(false)

const handleClick = () => {
    emitter.emit("UI::contextMenu::clickOutside")
    isReceivingPointerEvents.value = false
}

onMounted(() => {
    emitter.on("UI::contextMenu::createdNewContextMenu", () => {
        isReceivingPointerEvents.value = true
    })
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#ContextMenuGlobalRenderArea {
    z-index: 9999999;
    width: 100%;
    height: 100%;
    position: absolute;
    pointer-events: all;
}
</style>
