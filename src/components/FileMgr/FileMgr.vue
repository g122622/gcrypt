<template>
    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgr" :adapter="this.adapter"></DialogMgr>
    <div id="container" v-if="!isLoading">
        <v-app>
            <!-- 顶部工具栏 -->
            <v-app-bar density="compact">
                <!-- 导航按钮组 -->
                <v-btn icon @click="back()">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn icon @click="up()">
                    <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <!-- 新建按钮 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(item, index) in addList" :key="index" :value="index"
                            @click="item.handler.bind(this)()">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <!-- 引入按钮 -->
                <v-btn icon @click="handleFileImportClick()">
                    <input type="file" id='file-import' style="display: none;" />
                    <v-icon>mdi-import</v-icon>
                </v-btn>
                <!-- 地址栏 -->
                <div style="margin-left: 15px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                    <v-icon>mdi-map-marker</v-icon>
                    <v-breadcrumbs :items="currentDir.toBreadcrumbs()" density="compact" style="display: inline;">
                    </v-breadcrumbs>
                </div>
                <v-spacer></v-spacer>
                <v-btn icon @click="refresh()">
                    <v-icon>mdi-refresh</v-icon>
                </v-btn>
            </v-app-bar>
            <!-- 主内容区 -->
            <v-main :scrollable="false">
                <div v-if="currentFileTable.items.length > 0">
                    <div v-for="(item, index) in currentFileTable.items" :key="item.key">
                        <FileItem :displayMode="`this.viewOptions.displayMode`" :singleFileItem="item" :index="index"
                            @click="handleItemClick(item)" />
                    </div>
                </div>
                <div v-else style="display:flex;justify-content: center;flex-direction: column;align-items: center;">
                    <img src="./assets/fileMgr/noData.png" style="width:270px;" />
                    当前目录下没有文件
                </div>
            </v-main>
        </v-app>
    </div>
    <div v-if="isLoading" style="margin-left: 45%;margin-top: 20px;">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import FileItem from "./FileItem.vue"
import Addr from "../../api/core/common/Addr"
import sharedUtils from "../../utils/sharedUtils"
import DialogMgr from "./DialogMgr.vue";
import getFileName from "../../utils/getFileName";
import fs from "fs-extra";
import electron from "electron";
import os from "os";
import path from "path";
import lodash from "lodash";

export default defineComponent({
    name: 'FileMgr',
    components: {
        FileItem,
        DialogMgr
    },
    props: {
        stoLibSrc: String,
        viewOptions: Object,
    },
    data() {
        return {
            isLoading: true,
            currentFileTable: null,
            currentDir: new Addr(""),
            operationHistory: [],
            addList: [
                {
                    title: 'folder',
                    handler: function () {
                        this.$refs.DialogMgr.showAddFolderDialog()
                    },
                    icon: "mdi-folder"
                },
                {
                    title: 'file',
                    handler: function () {
                        this.$refs.DialogMgr.showAddFileDialog()
                    },
                    icon: "mdi-file"
                }
            ],
            adapter: null
        }
    },
    watch: {
        currentDir: {
            handler(newVal) {
                // the same,bye bye
                if (this.operationHistory.length !== 0) {
                    if (this.operationHistory[this.operationHistory.length - 1].compareWith(newVal)) {
                        return
                    }
                }
                this.operationHistory.push(lodash.cloneDeep(newVal))
                this.adapter.changeCurrentDirectory(newVal)
                this.currentFileTable = this.adapter.getCurrentFileTable()
            },
            deep: true
        }

    },
    methods: {
        handleItemClick(item) {
            if (item.type === "folder") {
                this.currentDir.down(item.name)
            } else if (item.type === "file") {
                this.openFile(item.name)
            }
        },
        handleFileImportClick() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let vueThis = this
            let foo: any = document.querySelector("#file-import")
            foo.click()
            foo.onchange = function () {
                if (foo.files.length === 0) {
                    return
                }
                let filePath = foo.files[0].path
                vueThis.adapter.writeFile(getFileName(filePath, true), fs.readFileSync(filePath)).then(() => {
                    vueThis.$emitter.emit("showMsg", { level: "success", msg: "导入文件成功" })
                    vueThis.refresh()
                })
            }
        },
        refresh() {
            this.$nextTick().then(() => {
                // 不用cloneDeep就不行
                this.currentFileTable.items = lodash.cloneDeep(this.adapter.getCurrentFileTable().items)
                this.$forceUpdate()
                this.$emitter.emit("showMsg", { level: 'success', msg: `刷新成功` })
            })
        },
        up() {
            this.currentDir.up()
        },
        back() {
            if (this.operationHistory.length >= 2) {
                this.currentDir = this.operationHistory[this.operationHistory.length - 2]
            }
        },
        openFile(filename) {
            const tmpdir = path.join(os.tmpdir(), sharedUtils.getHash(16))
            fs.writeFile(tmpdir, this.adapter.readFile(filename)).then(function () {
                electron.shell.openExternal(tmpdir)
            })
        },
        initAll(adapter, initedAdapterPromise) {
            initedAdapterPromise.then(() => {
                this.adapter = adapter
                this.currentDir = new Addr("")
                this.isLoading = false
            })
        }
    },
    mounted() {
        this.isLoading = true
        this.$emitter.on("FileMgr::setAdapter", ({ adapter, initedAdapterPromise }) => {
            this.initAll(adapter, initedAdapterPromise)
        })
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.v-breadcrumbs-item {
    font-size: 14px !important;
    margin: -10px;
}
</style>
