<template>
    // TODO 按钮的大小
    <v-btn icon @click="props?.onClick($event)"
        :size="props.size || 'normal'"
        v-bind="props.vBind">
        <v-icon>{{props.icon}}</v-icon>
        <v-tooltip activator="parent" location="bottom"
         v-if="props.tooltip">
            {{props.tooltip}}
        </v-tooltip>
    </v-btn>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface Props {
    icon: string
    onClick?: ()=>void
    tooltip?: string,
    vBind?:any
}

const props = defineProps<Props>()


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>