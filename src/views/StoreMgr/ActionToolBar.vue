<template>
    <ActionToolBarBase ToolbarTitle="加密库">
        <v-btn icon @click="this.$parent.handleAddStoreClick();">
            <v-icon>mdi-plus</v-icon>
            <v-tooltip activator="parent" location="bottom">新建加密库</v-tooltip>
        </v-btn>
        <v-btn icon @click="this.$parent.handleImportStoreClick();">
            <v-icon>mdi-import</v-icon>
            <v-tooltip activator="parent" location="bottom">导入加密库</v-tooltip>
        </v-btn>
    </ActionToolBarBase>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: 'ActionToolBar',
    props: {

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
