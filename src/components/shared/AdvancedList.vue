<template>
    <!-- 顶部工具栏 -->
    <ToolBarBase :ToolbarTitle="subheader ?? ''">
        <template #prepend>
            <!-- 搜索框 -->
            <AdvancedTextField label="搜索..." prepend-inner-icon="mdi-magnify" v-model:currentInput="searchWord"
                density="compact">
            </AdvancedTextField>
        </template>
        <IconBtn icon="mdi-arrow-up" @click="handleBackToTop()" tooltip="回到顶部" v-if="matchedItems.length >= 1" />
    </ToolBarBase>

    <template v-if="matchedItems.length >= 1">
        <!-- 列表主内容 -->
        <v-list :lines="lines ?? 'one'" :density="density ?? 'compact'" :width="width" :height="height"
            :id="`advanced-list-${guid}`">
            <slot :matchedItems="matchedItems" />
        </v-list>
        <BottomTip v-if="useBottomTip" />
    </template>
    <div v-else
        style=" display:flex;justify-content: center;flex-direction: column;align-items: center;margin-bottom: 20px;">
        <img src="./assets/fileMgr/404.png" style="width:200px;" />
        暂无内容
        <div v-if="props.emptyTip">{{ props.emptyTip }}</div>
    </div>
</template>

<script setup lang="ts">
import sharedUtils from "@/utils/sharedUtils";
import traverseObj from "@/utils/traverseObj";
import { ref, computed } from "vue"
import AdvancedTextField from "@/components/shared/AdvancedTextField.vue";

interface Props {
    density?: 'default' | 'comfortable' | 'compact',
    height?: string | number,
    useBottomTip?: boolean,
    useSearch?: boolean,
    items: any[],
    subheader?: string,
    lines?: false | 'one' | 'two' | 'three',
    width?: string,
    emptyTip?: string
}
const props = defineProps<Props>()
const guid = sharedUtils.getHash(16)
const searchWord = ref("")
const matchedItems = computed(() => {
    if (props.useSearch && searchWord.value) {
        return props.items.filter((item) => {
            let flag = false
            // 优化：flag一旦为true就立即返回（abort），不继续遍历
            traverseObj(item, (key, value, abort) => {
                if (typeof value === "string" && value.includes(searchWord.value)) {
                    flag = true
                    abort()
                }
            })
            return flag
        })
    } else {
        return props.items
    }
})

const handleBackToTop = () => {
    document.querySelector(`#advanced-list-${guid}`).scrollTop = 0
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.v-input {
    border-radius: 15px;
    overflow: hidden;
    margin: 5px;
}
</style>
