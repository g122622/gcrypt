<template>
    <v-toolbar density="compact" color="rgba(0,0,0,0)" style="margin: 5px;">
        <div style="font-size: 1em; width: auto;margin: 10px;font-weight: ;">{{ props.ToolbarTitle }}</div>
        <slot name="prepend"></slot>
        <!-- 默认插槽，默认append到末尾 -->
        <slot></slot>
    </v-toolbar>
</template>

<script setup lang="ts">
const props = defineProps<{
    ToolbarTitle: string
}>()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
