<template>
    <Teleport to="#ActionToolBar">
        <ActionToolBar></ActionToolBar>
    </Teleport>

    <input type="file" id='store-import' style="display: none;" />

    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgr"></DialogMgr>

    <div id="container">
        <v-list lines="two">
            <v-list-subheader>加密库列表</v-list-subheader>
            <v-list-item v-for="item in storeList" :key="item.storageName + Math.random()" :title="item.storageName"
                :subtitle="new Date(item.createdTime).toLocaleString()" @click="handleClick(item.entryKey)">
                <template v-slot:prepend>
                    <v-avatar color="grey-lighten-1">
                        <v-icon color="white">mdi-lock</v-icon>
                    </v-avatar>
                </template>

                <template v-slot:append>
                    <v-btn icon @click.stop="_removeStore(item.storeSrc)">
                        <v-icon>mdi-delete</v-icon>
                        <v-tooltip activator="parent" location="left">移除</v-tooltip>
                    </v-btn>
                    <v-btn icon>
                        <v-icon>mdi-information</v-icon>
                        <v-tooltip activator="parent" location="left">{{ JSON.stringify(item) }}</v-tooltip>
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
    </div>
    <BottomTip></BottomTip>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import ActionToolBar from "./ActionToolBar.vue";
import DialogMgr from "./DialogMgr.vue";
import Adapter from "../../api/core/adapters/gcryptV1/adapter"
import FileMgr from "@/components/FileMgr/FileMgr.vue"

import KvpClass from "@/api/core/adapters/gcryptV1/KVPEngineJson"
import EeClass from "@/api/core/adapters/gcryptV1/encryptionEngineAES192"
import sharedUtils from "@/utils/sharedUtils";
import sleep from "@/utils/sleep";

export default defineComponent({
    name: 'StoreMgr',
    props: {
    },
    components: {
        ActionToolBar,
        DialogMgr
    },
    data() {
        return {
            storeList: [],
            selectedStore: null
        }
    },
    methods: {
        handleClick(entryKey) {
            this.selectedStore = this.storeList.find(item => item.entryKey === entryKey)
            this.$refs.DialogMgr.showPasswordDialog()
        },

        /**
         * 只是界面点击的处理方法，不是真正的addstore处理方法（handleAddStore才是）
         */
        handleAddStoreClick() {
            this.$refs.DialogMgr.showAddStoreDialog()
        },

        /**
        * 只是界面点击的处理方法
        */
        handleImportStoreClick() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let vueThis = this
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

                vueThis._inspectStoreSrc(filePath)
                vueThis.$emitter.emit("showMsg",
                    {
                        level: "success",
                        msg: "导入加密库成功<br>请注意，元数据只有在输入密码成功进入后才会有效"
                    }
                )
            }
        },

        /**
         * note:这里的src是用户指定的文件夹路径，不是文件路径！！！
         * 只能由dialogmgr调用
         * @param storeSrc
         * @param storeName
         * @param pwd
         */
        async handleDialogAddStore(storeSrc, storeName, pwd) {
            // 格式化文件路径
            let formattedDirPath = storeSrc.replaceAll("\\", '/')
            if (formattedDirPath[formattedDirPath.length - 1] === "/") {
                formattedDirPath = formattedDirPath.slice(0, formattedDirPath.length - 1)
            }
            // 用filemgr打开
            let realSrc = `${formattedDirPath}/${storeName}.json`
            this._openStore(realSrc, pwd)
        },

        handleDialogPassword(pwd) {
            this._openStore(this.selectedStore.storeSrc, pwd)
        },

        /**
         * 打开存储库的唯一方法
         * 利用lodash的数组去重来识别打开的那个store是否是第一次打开，
         * 若是则写入electron-store
         * @param storeSrc
         * @param pwd
         */
        async _openStore(storeSrc, pwd) {
            if (!pwd) {
                this.$emitter.emit("showMsg", { level: "error", msg: "密码无效，请重新输入" })
                return
            }

            const adapter = new Adapter()
            const adapterGuid = sharedUtils.getHash(16)
            await adapter.initAdapter(storeSrc, pwd, new KvpClass(), new EeClass(), adapterGuid)
            this._inspectStoreSrc(storeSrc, adapter.getMeta())

            this.$emitter.emit("Action::addTab", {
                name: storeSrc,
                component: FileMgr,
                icon: "mdi-folder",
                onClick: () => null,
                props: { adapter }
            })
        },

        /**
         * 根据src移除store
         * @param storeSrc
         */
        _removeStore(storeSrc) {
            this.$emitter.emit("showMsg", {
                level: "warning",
                msg: "确实要移除这个加密库吗<br>现在你有几秒时间来作出决定",
                actionButtons: [
                    {
                        title: '确定',
                        onClick: () => {
                            this.storeList = this.storeList.filter(item => { return item.storeSrc !== storeSrc })
                            this.$electronStore.set("storeList", this.storeList)
                            this.$emitter.emit("showMsg", { level: "success", msg: "store移除成功，这并不会删除源文件！" })
                        },
                    },
                    {
                        title: '取消'
                    },
                ]
            })
        },

        /**
         * 检查这个src是否似曾相识，
         * 如果是第一次打开，或者meta元数据发生改变，
         * 则更新当前存储库表并写入electron-store
         * @param storeSrc
         */
        _inspectStoreSrc(storeSrc, meta) {
            /* 内存：更新当前存储库表 */
            let finds = this.storeList.filter(item => { return item.storeSrc === storeSrc })

            if (finds.length > 0) {
                if (this.$lodash.isEqual(finds[0], { ...meta, storeSrc })) {
                    return // 如果storeSrc已存在且数据完全一样，就返回；否则更新
                } else {
                    this.storeList = this.storeList.filter(item => item.storeSrc !== storeSrc)
                    this.storeList.push({ ...meta, storeSrc })
                }
            } else {
                this.storeList.push({ ...meta, storeSrc })
            }

            /* 本地：存储storeList */
            this.$electronStore.set("storeList", this.storeList)
        }
    },

    mounted() {
        // 检测到第一次使用electron-store，没有数据
        if (this.$electronStore.get("storeList") === undefined) {
            this.$electronStore.set("storeList", [])
            this.storeList = []
        } else {
            this.storeList = this.$electronStore.get("storeList")
        }
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
