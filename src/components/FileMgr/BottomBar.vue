<template>
    <div id="filemgr-BottomBar">
        {{ props.currentFileTableForRender.items.length }} 个对象
    </div>
</template>

<script setup lang="ts">
import fileTable from "@/api/core/types/fileTable";
import { ref } from "vue"

interface Props {
    currentFileTableForRender: fileTable
}
const props = defineProps<Props>()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#filemgr-BottomBar {
    height: 15px;
    background-color: aqua;
}
</style>
