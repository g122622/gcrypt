<template>
    <div id="right-click-area" @click.right="handleRightClick($event)" />

    <Teleport to="#ContextMenuGlobalRenderArea">
        <Transition name="ctxmenu-transition">
            <div class='context_menu_container' ref="container"
                :style="{ marginTop: coordY + 'px', marginLeft: coordX + 'px', width: props.width + 'px', opacity: isTransparent ? '0' : '1' }"
                v-if="isInDOM">
                <div v-for="(list, indexi) in computedMenuLists" :key="indexi">
                    <v-list density="compact">
                        <v-list-item v-for="(item, indexj) in list" :key="item.text" :value="indexj"
                            @click="item.actions.onClick($event)">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title>{{ item.text }}</v-list-item-title>
                            <v-tooltip activator="parent" location="right">{{ item.text }}</v-tooltip>
                        </v-list-item>

                    </v-list>
                    <!-- 只有子list数大于等于1时才显示分割线 -->
                    <v-divider v-if="computedMenuLists.length >= 1 && indexi !== computedMenuLists.length - 1" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from "vue"
import contextMenuItem from "@/types/contextMenuItem"
import emitter from "@/eventBus"

const container = ref<HTMLElement>()
const coordX = ref<number>(0)
const coordY = ref<number>(0)
const isInDOM = ref<boolean>(false)
const isTransparent = ref(false)
// const offsetX = 0
// const offsetY = 0
interface Props {
    menuList: Array<contextMenuItem>,
    width: number
}
const props = defineProps<Props>()

// 为了顺利展示分割线
const computedMenuLists = computed(() => {
    let res = [[]]
    props.menuList.forEach((item) => {
        if (item.type === "divider") {
            // 新起一个数组
            res.push([])
        } else {
            res[res.length - 1].push(item)
        }
    })
    return res
})

const handleRightClick = async (event) => {
    // pre-render to get menu's size
    isTransparent.value = true
    isInDOM.value = true
    await nextTick()
    const height = container.value.offsetHeight
    isTransparent.value = false
    isInDOM.value = false
    await nextTick()
    coordX.value = event.pageX + props.width > document.body.offsetWidth ? document.body.offsetWidth - props.width : event.pageX
    coordY.value = event.pageY + height > document.body.offsetHeight ? document.body.offsetHeight - height : event.pageY
    emitter.emit("UI::contextMenu::createdNewContextMenu")
    isInDOM.value = true
}

onMounted(() => {
    emitter.on("UI::contextMenu::clickOutside", () => {
        isInDOM.value = false
    })
})

onUnmounted(() => {
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
    top: 0;
}

.context_menu_container {
    border-radius: 15px;
    overflow: hidden;
    box-shadow: var(--shadow-x4_hover);

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
