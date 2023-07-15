<template>
    <v-app-bar density="compact">
        <v-app-bar-title style="font-size: 1em;">{{ props.ToolbarTitle }}</v-app-bar-title>
        <slot name="prepend"></slot>
        <v-spacer></v-spacer>
        <!-- 默认插槽，默认append到末尾 -->
        <slot></slot>
        <v-btn icon @click="this.$router.push('./home')">
            <v-icon>mdi-home</v-icon>
            <v-tooltip activator="parent" location="bottom">主页</v-tooltip>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
            <v-tooltip activator="parent" location="bottom">更多</v-tooltip>
        </v-btn>
    </v-app-bar>
</template>

<script setup lang="ts">
const props = defineProps<{
    ToolbarTitle: string
}>()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
