<template>
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="加密库">
            <IconBtn icon="mdi-plus" tooltip="新建加密库" @click="handleAddStoreClick();"></IconBtn>
            <IconBtn icon="mdi-import" tooltip="导入加密库" @click="handleImportStoreClick();"></IconBtn>
        </ActionToolBarBase>
    </Teleport>

    <input type="file" id='store-import' style="display: none;" />

    <!-- password对话框 -->
    <DialogGenerator title="输入密码" v-model:isDialogOpen="models.isPasswordDialogOpen" height="350px" width="600px"
        :isPersistent="true" :bottomActions="[
            { text: '取消', onClick: () => { models.isPasswordDialogOpen = false } },
            { text: '确定', onClick: () => { onPasswordConfirm() } }
        ]">
        <template #mainContent>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field autofocus label="密码*" required density="compact" v-model="password"
                                :rules="[() => !!password || '请输入密码']" ref="passwordInputView"
                                :type="showPassword ? 'text' : 'password'"
                                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="showPassword = !showPassword"
                                @keyup.enter="onPasswordConfirm()"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
                <small>*密码为必填项</small>
            </v-card-text>
        </template>
    </DialogGenerator>

    <AdvancedList lines="two" subheader="加密库列表" :items="encryptionStore.storeList" useBottomTip useSearch
        v-slot="{ matchedItems }" emptyTip="请点击右上角的“+”新建一个加密库，或导入一个加密库">
        <v-list-item v-for="item in matchedItems" :key="item.storeEntryJsonSrc" :title="item.storageName"
            :subtitle="new Date(item.createdTime).toLocaleString()" @click=" handleItemClick(item)">
            <template v-slot:prepend>
                <v-avatar color="primary">
                    <v-icon color="white">mdi-lock</v-icon>
                </v-avatar>
            </template>

            <template v-slot:append>
                <IconBtn icon="mdi-folder" tooltip="打开所在文件夹"
                    @click.stop="Electron.shell.openPath(path.dirname(item.storeEntryJsonSrc))"></IconBtn>
                <IconBtn icon="mdi-delete" tooltip="移除" @click.stop="encryptionStore.removeStore(item.storeEntryJsonSrc)">
                </IconBtn>
                <IconBtn icon="mdi-information" :tooltip="JSON.stringify(item)"></IconBtn>
            </template>
        </v-list-item>
    </AdvancedList>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useEncryptionStore } from "@/store/encryption";
import EntryJson from "@/api/core/types/EntryJson";
import NewStoreWizard from "@/views/NewStoreWizard/NewStoreWizard.vue";
import emitter from "@/eventBus";
import Electron from 'electron'
import path from 'path'

interface StoreListItem extends EntryJson {
    storeEntryJsonSrc: string
}

const encryptionStore = useEncryptionStore()
const models = reactive({
    isPasswordDialogOpen: false,
})
const selectedStore = ref<StoreListItem>(null)
const password = ref("")
const passwordInputView = ref()
const showPassword = ref<boolean>(false)

/* 密码相关 */
const handleItemClick = (item) => {
    // NOTE 可能存在引用赋值导致的潜在bug
    selectedStore.value = item
    models.isPasswordDialogOpen = true
}
const onPasswordConfirm = async () => {
    passwordInputView.value.validate(true)
    if (password.value) {
        const adapter = await encryptionStore.getInitedAdapter(
            selectedStore.value.storeEntryJsonSrc,
            password.value,
            selectedStore.value)
        await encryptionStore.openStore(selectedStore.value.storeEntryJsonSrc, adapter)
        models.isPasswordDialogOpen = false
    }
    password.value = ''
}

/* 顶部工具栏相关 */
/**
 * 只是界面点击的处理方法，不是真正的addstore处理方法（handleAddStore才是）
 */
const handleAddStoreClick = () => {
    emitter.emit("Action::addTab", {
        name: "创建新加密库",
        component: NewStoreWizard,
        icon: "mdi-folder",
        onClick: () => null,
        props: {}
    })
}

/**
* 只是界面点击的处理方法
*/
const handleImportStoreClick = () => {
    let foo: any = document.querySelector("#store-import")
    foo.click()
    foo.onchange = function () {
        if (foo.files.length === 0) {
            return
        }
        let filePath: string = foo.files[0].path
        // 格式化文件路径
        filePath = filePath.replaceAll("\\", '/')
        if (filePath[filePath.length - 1] === "/") {
            filePath = filePath.slice(0, filePath.length - 1)
        }
        encryptionStore.importStore(filePath)
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
