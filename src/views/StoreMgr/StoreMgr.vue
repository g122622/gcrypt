<template>
    <Teleport to="#ActionToolBar">
        <ActionToolBar></ActionToolBar>
    </Teleport>

    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgr"></DialogMgr>

    <div id="container">
        <v-list lines="two">
            <v-list-subheader>加密库列表</v-list-subheader>
            <v-list-subheader>
                <v-btn color="blue-grey" prepend-icon="mdi-plus" @click="handleAddStoreClick();">
                    新建加密库
                </v-btn>
            </v-list-subheader>
            <v-list-item v-for="item in storeList" :key="item.storageName + Math.random()" :title="item.storageName"
                :subtitle="new Date(item.createdTime).toLocaleString()" @click="handleClick(item.entryKey)">
                <template v-slot:prepend>
                    <v-avatar color="grey-lighten-1">
                        <v-icon color="white">mdi-lock</v-icon>
                    </v-avatar>
                </template>

                <template v-slot:append>
                    <v-btn color="grey-lighten-1" icon="mdi-information" variant="text"></v-btn>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import ActionToolBar from "./ActionToolBar.vue";
import DialogMgr from "./DialogMgr.vue";
import adapter from "../../api/core/adapters/gcryptV1/adapter";

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
        handlePassword(pwd) {
            this._openStore(this.selectedStore.storeSrc, pwd)
        },
        /**
         * 只是界面点击的处理方法，不是真正的addstore处理方法（handleAddStore才是）
         */
        handleAddStoreClick() {
            console.log(this.storeList)
            this.$refs.DialogMgr.showAddStoreDialog()
        },
        /**
         *note:这里的src是用户指定的文件夹路径，不是文件路径！！！
         * @param storeSrc
         * @param storeName
         * @param pwd
         */
        async handleAddStore(storeSrc, storeName, pwd) {
            // 用filemgr打开
            let realSrc = `${storeSrc.replaceAll("\\", "/")}/${storeName}.json`
            this._openStore(realSrc, pwd)
        },
        /**
         * inner method for opening an external store gracefully
         * @param storeSrc
         * @param pwd
         */
        async _openStore(storeSrc, pwd) {
            if (!pwd) {
                this.$emitter.emit("showMsg", { level: "error", msg: "密码无效，请重新输入" })
                return
            }
            this.$router.push("./files")
            this.$nextTick().then(() => {
                let initedAdapterPromise = adapter.initAdapter(storeSrc, pwd)
                initedAdapterPromise.then((meta) => {
                    /* 内存：更新当前存储库表 */
                    this.storeList.push({ ...meta, storeSrc })
                    this.storeList = this.$lodash.uniqBy(this.storeList, item => item.entryKey) // 根据entryKey进行去重
                    /* 本地：存储storeList */
                    this.$electronStore.set("storeList", this.storeList)
                    setTimeout(() => {
                        /* 初始化fileMgr */
                        const foo = { adapter, initedAdapterPromise }
                        this.$emitter.emit("FileMgr::setAdapter", foo)
                    }, 1000)
                })
            })
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
<style scoped lang="less">

</style>
