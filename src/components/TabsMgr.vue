<template>
    <div style="container-type: inline-size;">
        <div class="v-list-item-title" style="text-align: center;font-size: small;margin-top: 10px;" id="tabs-counter">
            标签页({{ dynamicTabs.length }})
        </div>

        <!-- 动态标签页 -->
        <v-list density="compact" nav>
            <v-list-item v-for="item in dynamicTabs" :title="item.name" @click="item.handleClick()" :key="item.name"
                :active="`/${item.legalPath}` === route.fullPath">
                <template #prepend>
                    <v-icon>
                        {{ item.icon }}
                    </v-icon>
                </template>
                <template #append>
                    <IconBtn size="x-small" icon="mdi-close" tooltip="关闭标签页" @click="item.handleClose()" variant="plain" />
                </template>
                <v-tooltip activator="parent" location="right">
                    {{ item.name }}
                </v-tooltip>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import TabsMgr from "@/api/TabsMgr";
import emitter from "@/eventBus";
import { useRoute } from 'vue-router'

const route = useRoute()
const dynamicTabs = ref<Array<any>>([])
let tabsMgr = null
const activeTab = ref<string>('')

onMounted(() => {
    // 初始化逻辑实例
    tabsMgr = new TabsMgr()

    // 初始化主事件
    emitter.on("Action::addTab", (payload) => {
        tabsMgr.addTab(payload)
    })

    emitter.on("Action::removeTab", (payload) => {
        tabsMgr.removeTab(payload)
    })

    // 初始化UI事件
    emitter.on("UI::addTabItem", ({ name, legalPath, icon, onClick, onClose }) => {
        dynamicTabs.value.push({
            name,
            icon,
            legalPath,
            handleClick: async () => {
                tabsMgr.switchToTab(legalPath)
                activeTab.value = name
                await onClick()
            },

            handleClose: async () => {
                // 执行onClose钩子
                if (onClose) {
                    // NOTE: onClose可以返回promise，也可以是普通的void函数
                    // 使用时可以在onClose函数里面reject掉promise，这样会阻止标签页继续关闭
                    await Promise.resolve(onClose)
                }
                // 移除标签页
                dynamicTabs.value = dynamicTabs.value.filter(item => item.name !== name)

                emitter.emit("Action::removeTab", { name })
            }
        })
    })
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.v-list-item__prepend>.v-icon {
    margin-inline-end: 10px;
}

@container (width < 70px) {
    #tabs-counter {
        display: none;
    }
}
</style>
