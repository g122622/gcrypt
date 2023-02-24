<template>
    <ActionToolBarBase ToolbarTitle="加密库"></ActionToolBarBase>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import ActionToolBarBase from "../../components/ActionToolBarBase.vue";

export default defineComponent({
    name: 'ActionToolBar',
    props: {

    },
    components: {
        ActionToolBarBase
    },
    data() {
        return {
        }
    },
    // mounted() {

    // }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.v-toolbar-title {
    font-size: 15px;
}
</style>
