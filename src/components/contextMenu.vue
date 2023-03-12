<template>
    <div id="right-click-area" @click.right="handleRightClick($event)" />

    <Teleport to="#ContextMenuGlobalRenderArea">
        <Transition name="ctxmenu-transition">
            <div class='context_menu_container' :style="{ marginTop: coordY + 'px', marginLeft: coordX + 'px' }"
                v-if="isShowing">
                <v-list density="compact">
                    <v-list-item v-for="(item, index) in props.menuList" :key="index" :value="index"
                        @click="item.actions.onClick($event)">
                        <template v-slot:prepend>
                            <v-icon :icon="item.icon"></v-icon>
                        </template>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                        <v-tooltip activator="parent" location="right">{{ item.text }}</v-tooltip>
                    </v-list-item>
                </v-list>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue"
import contextMenuItem from "@/types/contextMenuItem"
import emitter from "@/eventBus"

const coordX = ref<number>(0)
const coordY = ref<number>(0)
const isShowing = ref<boolean>(false)
const offsetX = 0
const offsetY = 0

interface Props {
    menuList: Array<contextMenuItem>
}

const props = defineProps<Props>()

const handleRightClick = async (event) => {
    isShowing.value = true
    emitter.emit("UI::contextMenu::createdNewContextMenu")
    await nextTick()
    coordX.value = event.pageX + offsetX
    coordY.value = event.pageY + offsetY
}

onMounted(() => {
    emitter.on("UI::contextMenu::clickOutside", () => {
        isShowing.value = false
    })
})

onUnmounted(() => {
    // TODO 有这个off方法吗
    emitter.off("UI::contextMenu::clickOutside")
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
#right-click-area {
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
}

.context_menu_container {
    width: 200px;
    border-radius: 15px;
    overflow: hidden;
}

.ctxmenu-transition-enter-active {
    transition: all 0.1s ease-out;
}

.ctxmenu-transition-leave-active {
    transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.ctxmenu-transition-enter-from,
.ctxmenu-transition-leave-to {
    transform: translate(-5px, -5px);
}
</style>
