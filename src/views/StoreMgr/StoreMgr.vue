<template>
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="加密库">
            <v-btn icon @click="this.$parent.handleAddStoreClick();">
                <v-icon>mdi-plus</v-icon>
                <v-tooltip activator="parent" location="bottom">新建加密库</v-tooltip>
            </v-btn>
            <v-btn icon @click=" this.$parent.handleImportStoreClick();">
                <v-icon>mdi-import</v-icon>
                <v-tooltip activator="parent" location="bottom">导入加密库</v-tooltip>
            </v-btn>
        </ActionToolBarBase>
    </Teleport>

    <input type="file" id='store-import' style="display: none;" />

    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgr"></DialogMgr>

    <!-- <AdvancedList lines="two" subheader="加密库列表" :itemAmount="storeList.length">
        <v-list-item v-for="item in storeList" :key="item.storageName + Math.random()" :title="item.storageName"
            :subtitle="new Date(item.createdTime).toLocaleString()" @click=" handleClick(item.entryKey)">
            <template v-slot:prepend>
                <v-avatar color="grey-lighten-1">
                    <v-icon color="white">mdi-lock</v-icon>
                </v-avatar>
            </template>

            <template v-slot:append>
                <v-btn icon @click.stop=" _removeStore(item.storeSrc)">
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="left">移除</v-tooltip>
                </v-btn>
                <v-btn icon>
                    <v-icon>mdi-information</v-icon>
                    <v-tooltip activator="parent" location="left">{{ JSON.stringify(item) }}</v-tooltip>
                </v-btn>
            </template>
        </v-list-item>
    </AdvancedList> -->
</template>

<script lang="ts">
import { ref, onMounted } from "vue"
import sharedUtils from "@/utils/sharedUtils";

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
