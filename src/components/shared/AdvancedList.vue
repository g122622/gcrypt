<template>
    <!-- 搜索框 -->
    <v-text-field label="搜索..." prepend-inner-icon="mdi-magnify" v-model="searchWord"></v-text-field>
    <div v-if="matchedItems.length >= 1">
        <!-- 列表主内容 -->
        <v-list :lines="lines ?? 'one'" :density="density ?? 'compact'" :width="width" :height="height">
            <v-list-subheader v-if="subheader">
                {{ subheader }}
            </v-list-subheader>
            <slot :matchedItems="matchedItems" />
        </v-list>
        <BottomTip v-if="useBottomTip" />
    </div>
    <div v-else style=" display:flex;justify-content: center;flex-direction: column;align-items: center;">
        <img src="./assets/fileMgr/404.png" style="width:200px;" />
        暂无内容
    </div>
</template>

<script setup lang="ts">
import traverseObj from "@/utils/traverseObj";
import { ref, computed } from "vue"

interface Props {
    density?: 'default' | 'comfortable' | 'compact',
    height?: string | number,
    useBottomTip?: boolean,
    useSearch?: boolean,
    items: any[],
    subheader?: string,
    lines?: false | 'one' | 'two' | 'three',
    width?: string
}
const props = defineProps<Props>()
const searchWord = ref("")
const matchedItems = computed(() => {
    if (props.useSearch) {
        return props.items.filter((item) => {
            let flag = false
            // TODO 可以优化：flag一旦为true就立即返回，不继续遍历
            traverseObj(item, (key, value) => {
                if (typeof value === "string" && value.includes(searchWord.value)) {
                    flag = true
                }
            })
            return flag
        })
    } else {
        return props.items
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.v-input {
    border-radius: 15px;
    overflow: hidden;
    height: 56px;
    margin: 5px;
}
</style>
