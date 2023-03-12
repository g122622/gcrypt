
<template>
    <v-app-bar density="compact">
        <v-app-bar-title>{{ this.ToolbarTitle }}</v-app-bar-title>
        <v-spacer></v-spacer>
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

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: 'ActionToolBarBase',
    props: {
        ToolbarTitle: String
    },
    data() {
        return {
        }
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
