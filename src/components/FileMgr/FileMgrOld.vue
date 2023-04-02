<template>
    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgr" :adapter="this.adapter"></DialogMgr>
    <!-- 文件属性 -->
    <DialogGenerator title="属性" v-model:isDialogOpen="models.isPropOpening">
        <template #mainContent>
            <v-list lines="one">
                <v-list-subheader>属性值</v-list-subheader>
                <v-list-item v-for="key in Object.keys(itemCache)" :key="key" :title="key">
                    <template #append>
                        {{ itemCache[key] }}
                        <IconBtn icon="mdi-content-copy" tooltip="复制到剪贴板" size="small"
                            @click="copyToClipboard(itemCache[key])" />
                    </template>
                </v-list-item>
            </v-list>
        </template>
    </DialogGenerator>

    <div id="file_mgr_container" v-if="!isLoading">
        <v-app>
            <!-- 顶部工具栏 -->
            <v-app-bar density="compact">
                <!-- 导航按钮组 -->
                <v-btn icon @click="back()">
                    <v-icon>mdi-arrow-left</v-icon>
                    <v-tooltip activator="parent" location="bottom">后退</v-tooltip>
                </v-btn>
                <v-btn icon @click="up()">
                    <v-icon>mdi-arrow-up</v-icon>
                    <v-tooltip activator="parent" location="bottom">上一级目录</v-tooltip>
                </v-btn>
                <!-- 布局按钮组 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>mdi-view-module</v-icon>
                            <v-tooltip activator="parent" location="bottom">布局选项</v-tooltip>
                        </v-btn>
                    </template>
                    <v-btn-toggle shaped mandatory divider>
                        <v-btn v-for="item in displayModeList" :key="item.title" @click="item.handler">
                            <v-icon>{{ item.icon }}</v-icon>
                            <v-tooltip activator="parent" location="bottom">{{ item.title }}</v-tooltip>
                        </v-btn>
                    </v-btn-toggle>
                </v-menu>
                <!-- 新建按钮 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>mdi-plus</v-icon>
                            <v-tooltip activator="parent" location="bottom">新建文件系统对象</v-tooltip>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(item, index) in addList" :key="index" :value="index"
                            @click="item.handler.bind(this)()">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                            <v-tooltip activator="parent" location="bottom">{{ item.title }}</v-tooltip>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <!-- 引入按钮 -->
                <v-btn icon @click="handleFileImportClick()">
                    <input type="file" id='file-import' style="display: none;" />
                    <v-icon>mdi-import</v-icon>
                    <v-tooltip activator="parent" location="bottom">从外部引入文件</v-tooltip>
                </v-btn>
                <!-- 地址栏 -->
                <div style="margin-left: 15px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                    <v-icon>mdi-map-marker</v-icon>
                    <v-tooltip activator="parent" location="bottom">{{ `当前目录: ` + currentDir.toPathStr() }}</v-tooltip>
                    <v-breadcrumbs :items="currentDir.toBreadcrumbs()" density="compact" style="display: inline;">
                    </v-breadcrumbs>
                </div>
                <v-spacer></v-spacer>
                <!-- 刷新按钮 -->
                <v-btn icon @click="refresh()">
                    <v-icon>mdi-refresh</v-icon>
                    <v-tooltip activator="parent" location="bottom">刷新内容</v-tooltip>
                </v-btn>
            </v-app-bar>

            <!-- 主内容区 -->
            <v-main :scrollable="true">
                <div v-if="currentFileTableForRender.length > 0">
                    <div v-for="(item, index) in currentFileTableForRender" :key="item.key">
                        <FileItem :displayMode="viewOptions.itemDisplayMode" :singleFileItem="item" :index="index"
                            @click="handleItemClick(item)">
                            <ContextMenu :width="200" :menuList="
                                [
                                    {
                                        text: '打开', icon: 'mdi-open-in-new', actions: { onClick: () => { handleItemClick(item) } }
                                    },
                                    {
                                        text: '删除', icon: 'mdi-delete', actions: { onClick: () => { deleteFile(item.name) } }
                                    },
                                    {
                                        text: '重命名', icon: 'mdi-rename-box', actions: { onClick: () => { /* renameFile(item.name)*/ } }
                                    },
                                    {
                                        type: 'divider'
                                    },
                                    {
                                        text: '属性', icon: 'mdi-information', actions: { onClick: () => { handlePropertiesClick(item) } }
                                    }]"></ContextMenu>
                        </FileItem>
                    </div>
                </div>
                <div v-else style=" display:flex;justify-content: center;flex-direction: column;align-items: center;">
                    <img src="./assets/fileMgr/noData.png" style="width:270px;" />
                    当前目录下没有文件
                </div>
                <BottomTip></BottomTip>
            </v-main>
        </v-app>
    </div>
    <div v-if="isLoading" style="display: flex;flex-direction: column;align-items: center;margin-top: 20px;">
        <v-progress-circular indeterminate color="primary" bg-color="rgba(0,0,0,0)"></v-progress-circular>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import FileItem from "./FileItem.vue"
import ContextMenu from "../ContextMenu.vue";
import Addr from "../../api/core/common/Addr"
import sharedUtils from "../../utils/sharedUtils"
import DialogMgr from "./DialogMgr.vue";
import getFileName from "../../utils/getFileName";
import fs from "fs-extra";
import electron from "electron";
import os from "os";
import path from "path";
import lodash from "lodash";
import dirSingleItem from "@/api/core/types/dirSingleItem";
import sleep from "@/utils/sleep";

export default defineComponent({
    name: 'FileMgr',
    components: {
        FileItem,
        DialogMgr,
        ContextMenu
    },
    props: {
        adapter: Object
    },
    data() {
        return {
            isLoading: true,
            currentFileTable: null,
            currentDir: new Addr(""),
            operationHistory: [],
            itemCache: null,
            models: {
                isPropOpening: false
            },
            viewOptions: {
                itemDisplayMode: "list",
                itemSize: "medium",
                sortBy: "name",
                folderFirst: true,
                sequence: "ascending", // ascending | decending
            },
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
            displayModeList: [
                {
                    title: '列表',
                    handler: function () {
                        this.viewOptions.itemDisplayMode = "list"
                    },
                    icon: "mdi-format-list-bulleted"
                },
                {
                    title: '平铺',
                    handler: function () {
                        this.viewOptions.itemDisplayMode = "item"
                    },
                    icon: "mdi-dots-grid"
                },
            ]
        }
    },
    watch: {
        currentDir: {
            async handler(newVal) {
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
    computed: {
        currentFileTableForRender() {
            if (!this.currentFileTable) {
                return []
            }
            // 数组浅拷贝
            let res = [...this.currentFileTable.items]
            // 这里的所有排序均为升序
            switch (this.viewOptions.sortBy) {
                case "name":
                    res.sort((a, b) => {
                        return a.name > b.name ? 1 : -1
                    })
                    break
                case "timeModify":
                    res.sort((a, b) => {
                        return a.meta.modifiedTime > b.meta.modifiedTime ? 1 : -1
                    })
            }
            // 降序排序
            if (this.viewOptions.sequence === "decending") {
                res.reverse()
            }
            if (this.viewOptions.folderFirst) {
                // NOTE: ES2019已经要求sort为稳定排序，没必要这样先展开再合并
                res = [...res.filter(item => item.type === "folder"), ...res.filter(item => item.type === "file")]
            }
            return res
        },
    },
    methods: {
        handleItemClick(item) {
            if (item.type === "folder") {
                this.currentDir.down(item.name)
            } else if (item.type === "file") {
                this.openFile(item.name)
            }
        },
        // TODO 测试复杂目录导入速度
        handleFileImportClick() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let vueThis = this
            let foo: HTMLInputElement = document.querySelector("#file-import")
            foo.click()
            foo.onchange = async () => {
                if (foo.files.length === 0) {
                    return
                }
                try {
                    for (const file of foo.files) {
                        await vueThis.adapter.writeFile(getFileName(file.path, true), fs.readFileSync(file.path))
                    }
                } catch (error) {
                    vueThis.$emitter.emit("showMsg",
                        {
                            level: "error",
                            msg: `导入文件失败 ${error.message}`
                        })
                    vueThis.refresh()
                    return
                }
                vueThis.$emitter.emit("showMsg",
                    {
                        level: "success",
                        msg: `导入${foo.files.length}个文件成功`
                    })
                vueThis.refresh()
            }
        },
        refresh() {
            this.$nextTick().then(() => {
                // 不用cloneDeep就不行
                this.currentFileTable.items = lodash.cloneDeep(this.adapter.getCurrentFileTable().items)
                // TODO 去掉这个forceupdate，看效果
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
        deleteFile(filename) {
            this.adapter.deleteFile(filename)
            this.refresh()
        },
        initAll() {
            this.isLoading = true
            this.currentDir = new Addr("")
            this.isLoading = false
        },
        handlePropertiesClick(item: dirSingleItem) {
            // TODO lodash 扁平化对象方法
            this.itemCache = { ...item, ...item.meta }
            this.models.isPropOpening = true
        },
        copyToClipboard(arg: string) {
            navigator.clipboard.writeText(arg)
        }
    },
    mounted() {
        this.initAll()
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.v-breadcrumbs-item {
    font-size: 14px !important;
    margin: -10px;
}

#file_mgr_container {
    container-type: inline-size;
}
</style>
