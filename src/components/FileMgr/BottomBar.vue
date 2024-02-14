<template>
    <div id="filemgr-BottomBar">
        共 {{ props.currentFileTableForRender.length }} 项
        <div v-if="props.selectedItems.size > 0" style="display: inline-block;">
            ，已选中 {{ props.selectedItems.size }} 项
        </div>
        <v-spacer></v-spacer>
        <slot></slot>
        <IconBtn variant="plain" size="x-small" icon="mdi-select-all" tooltip="全选" @click="emit('selectAll')"
            v-if="props.selectedItems.size < props.currentFileTableForRender.length"></IconBtn>
        <IconBtn variant="plain" size="x-small" icon="mdi-selection-off" tooltip="全不选" @click="emit('unSelectAll')"
            v-if="props.selectedItems.size > 0">
        </IconBtn>
        <IconBtn variant="plain" size="x-small" icon="mdi-select-compare" tooltip="反选" @click="emit('reverseSelection')">
        </IconBtn>
    </div>
</template>

<script setup lang="ts">
import DirSingleItem from '@/api/core/types/DirSingleItem';

interface Props {
    currentFileTableForRender: DirSingleItem[],
    selectedItems: Set<DirSingleItem>
}
const props = defineProps<Props>()
const emit = defineEmits(['selectAll', 'unSelectAll', 'reverseSelection'])

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#filemgr-BottomBar {
    height: 30px;
    width: 100%;
    // position: fixed;
    // bottom: 0;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 10px;
    padding-right: 10px;
    background: rgb(var(--v-theme-surface));
    font-size: 14px;
    z-index: 200;
}
</style>
