<template>
    <!-- 对话框管理器 -->
    <DialogMgr ref="DialogMgrRef" :adapter="props.adapter" :refresh="refresh"></DialogMgr>
    <!-- 文件属性 -->
    <DialogGenerator title="属性" v-model:isDialogOpen="models.isPropOpening" width="700px">
        <template #mainContent>
            <v-list lines="one" width="700px">
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
                    <v-card>
                        <v-list lines="one" width="300px">
                            <v-list-subheader>布局选项</v-list-subheader>
                            <v-list-item v-for="item in viewOptionsLists" :key="item.name" :title="item.name">
                                <template #append>
                                    <v-btn-toggle shaped mandatory divided v-model="viewOptions[item.modelName]">
                                        <v-btn v-for="listItem in item.list" :key="listItem.title">
                                            <v-icon>{{ listItem.icon }}</v-icon>
                                            <v-tooltip activator="parent" location="bottom">{{ listItem.title }}</v-tooltip>
                                        </v-btn>

                                    </v-btn-toggle>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card>
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
                    <input type="file" id='file-import' style="display: none;" multiple />
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
            <v-main style="display: block; height: 100%;">
                <div style="height: calc(100% - 63px); overflow-y: scroll;overflow-x: hidden;">
                    <div v-if="currentFileTableForRender.length > 0">
                        <!-- <TransitionGroup name="file-item-transition"> -->
                        <div v-for="(item, index) in currentFileTableForRender" :key="item.key">
                            <FileItem :displayMode="viewOptions.itemDisplayMode" :singleFileItem="item" :index="index"
                                @dblclick="handleItemClick(item)" :thumbnail="thumbnails[item.key] || ''"
                                @selected="handleItemSelection(item)" @unselected="handleItemUnselection(item)"
                                :isSelected="selectedItems.has(item)">
                                <ContextMenu :width="200" :menuList="getItemMenuList(item)">
                                </ContextMenu>
                            </FileItem>
                        </div>
                        <!-- </TransitionGroup> -->
                    </div>
                    <div v-else
                        style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <img src="./assets/fileMgr/404.png" style="width:270px;" />
                        当前目录下没有文件
                    </div>
                    <BottomTip></BottomTip>
                    <ContextMenu :width="200" :menuList="[
                        {
                            text: '上一级目录', icon: 'mdi-arrow-up', actions: { onClick: () => { up() } }
                        },
                        {
                            text: '后退', icon: 'mdi-arrow-left', actions: { onClick: () => { back() } }
                        },
                        {
                            type: 'divider'
                        },
                        {
                            text: '刷新', icon: 'mdi-refresh', actions: { onClick: () => { refresh() } }
                        }]">
                    </ContextMenu>
                </div>
                <!-- 底部栏 -->
                <BottomBar :currentFileTableForRender="currentFileTableForRender" :selectedItems="selectedItems"
                    @selectAll="selectAll()" @unSelectAll="unSelectAll()" @reverseSelection="reverseSelection()">
                </BottomBar>
            </v-main>
        </v-app>
    </div>
    <div v-if="isLoading" style="display: flex;flex-direction: column;align-items: center;margin-top: 20px;">
        <v-progress-circular indeterminate color="primary" bg-color="rgba(0,0,0,0)"></v-progress-circular>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from "vue";
import Addr from "@/api/core/common/Addr"
import getFileName from "@/utils/getFileName";
import fs from "fs-extra";
import Electron from "electron";
import lodash from "lodash";
import dirSingleItem from "@/api/core/types/dirSingleItem";
import fileTable from "@/api/core/types/fileTable";
import emitter from "@/eventBus";
import { error } from "@/utils/gyConsole";
import AdapterBase from "@/api/core/types/AdapterBase";
import File from "@/api/File";
import getExtName from "@/utils/getExtName";
import { useTaskStore } from '@/store/task'
import Task from "@/api/Task";
import sharedUtils from "@/utils/sharedUtils";

import ContextMenu from "../shared/ContextMenu.vue";
import FileItem from "./FileItem.vue"
import DialogMgr from "./DialogMgr.vue";
import BottomBar from "./BottomBar.vue"
import prettyBytes from "@/utils/prettyBytes";

interface Props {
    adapter: AdapterBase
}
const props = defineProps<Props>()
const taskStore = useTaskStore()
const isLoading = ref<boolean>(true)
const currentFileTable = ref<fileTable>(null)
const currentDir = ref(new Addr(""))
const operationHistory = ref([])
const itemCache = ref(null)
const models = reactive({
    isPropOpening: false
})
const addList = [
    {
        title: '文件夹',
        handler: function () {
            DialogMgrRef.value.showAddFolderDialog()
        },
        icon: "mdi-folder"
    },
    {
        title: '文件',
        handler: function () {
            DialogMgrRef.value.showAddFileDialog()
        },
        icon: "mdi-file"
    }
]

// <生命周期&初始化>
const initAll = () => {
    isLoading.value = true
    currentDir.value = new Addr("")
    isLoading.value = false
}

onMounted(async () => {
    initAll()
})

// <核心功能-文件相关>
watch(currentDir, async (newVal) => {
    await refresh(newVal)
},
    { deep: true })

const refresh = async (arg?: Addr) => {
    isLoading.value = true
    if (arg) {
        // 检查是否为无效操作
        if (operationHistory.value.length !== 0) {
            if (operationHistory.value[operationHistory.value.length - 1].compareWith(arg)) {
                return
            }
        }
        await props.adapter.changeCurrentDirectory(arg)
        operationHistory.value.push(lodash.cloneDeep(arg))
    }
    // 取消选择
    selectedItems.value.clear()
    // 更改currentFileTable
    currentFileTable.value = await props.adapter.getCurrentFileTable()
    // 加载缩略图
    await loadThumbnails()
    // 如果是纯刷新，则显示提示
    if (!arg) {
        emitter.emit("showMsg", { level: 'success', msg: `刷新成功` })
    }
    isLoading.value = false
}

const up = () => {
    currentDir.value.up()
}

const back = () => {
    if (operationHistory.value.length >= 2) {
        currentDir.value = operationHistory.value[operationHistory.value.length - 2]
    }
}

const openFile = (filename, fileguid) => {
    const fileArg = new File(fileguid)
    fileArg.fromAdapter(props.adapter, filename)

    emitter.emit('openFile', {
        fileArg,
        fileTypeArg: getExtName(filename)
    })
}

const importFile = async (filePath: string, taskGroupId: string) => {
    taskStore.addTask(new Task(async () => {
        const key = await props.adapter.writeFile(getFileName(filePath, true), fs.readFileSync(filePath))
        const tb = await getThumbnail(filePath)
        await addThumbnail(key, tb)
    }, `引入文件 ${filePath}`, taskGroupId), { runImmediately: false })
}

const deleteFile = async () => {
    for (let item of selectedItems.value) {
        await props.adapter.deleteFile(item.name)
        await deleteThumbnail(item.key)
    }
    await refresh()
}

// <UI>
const handlePropertiesClick = (item?: dirSingleItem) => {
    if (item) {
        itemCache.value = { ...item, ...item.meta }
        delete itemCache.value.meta
        models.isPropOpening = true
    } else {
        let totalSize = 0
        for (let element of selectedItems.value) {
            totalSize += element.meta.size
        }
        itemCache.value = {
            totalSize,
            totalSizeFormatted: prettyBytes(totalSize)
        }
        models.isPropOpening = true
    }
}

const handleItemClick = (item) => {
    if (item.type === "folder") {
        currentDir.value.down(item.name)
    } else if (item.type === "file") {
        openFile(item.name, item.key)
    }
}

const getItemMenuList = (item) => {
    if (selectedItems.value.size === 1) {
        return [
            {
                text: '打开', icon: 'mdi-open-in-new', actions: { onClick: () => { handleItemClick(item) } }
            },
            {
                text: '删除', icon: 'mdi-delete', actions: { onClick: () => { deleteFile() } }
            },
            {
                text: '重命名', icon: 'mdi-rename-box', actions: { onClick: () => { console.log(1) } }
            },
            {
                type: 'divider'
            },
            {
                text: '属性', icon: 'mdi-information', actions: { onClick: () => { handlePropertiesClick(item) } }
            }]
    } else {
        return [
            {
                text: '删除', icon: 'mdi-delete', actions: { onClick: () => { deleteFile() } }
            },
            {
                type: 'divider'
            },
            {
                text: '属性', icon: 'mdi-information', actions: { onClick: () => { handlePropertiesClick() } }
            }]
    }
}

const handleFileImportClick = () => {
    const taskGroupId = sharedUtils.getHash(16)
    let foo: HTMLInputElement = document.querySelector("#file-import")
    foo.click()
    foo.onchange = async () => {
        if (foo.files.length === 0) {
            return
        }
        try {
            for (const file of foo.files) {
                await importFile(file.path, taskGroupId)
            }
        } catch (error) {
            emitter.emit("showMsg",
                {
                    level: "error",
                    msg: `导入文件失败 ${error.message}`
                })
            await refresh()
            return
        }

        await taskStore.runTaskGroup(taskGroupId)
        emitter.emit("showMsg",
            {
                level: "success",
                msg: `导入${foo.files.length}个文件成功`
            })
        await refresh()
    }
}

// <外观选择相关>
const viewOptions = reactive({
    itemDisplayMode: 1, // 0 list, 1 item
    itemSize: 5, // 区间[0,10]的整数, '5' stands for medium size
    sortBy: 0, // 0 name, 1 timeModify
    folderFirst: 1,
    sequence: 0, // 0 ascending | 1 descending
    showHiddenItem: 1,
    showExtName: 1,
    showThumbnails: 1
})

const viewOptionsLists = [
    {
        name: '显示模式',
        modelName: 'itemDisplayMode',
        list: [
            {
                title: '列表',
                icon: "mdi-format-list-bulleted"
            },
            {
                title: '平铺',
                icon: "mdi-dots-grid"
            }]
    },
    {
        name: '排序依据',
        modelName: 'sortBy',
        list: [
            {
                title: '名称',
                icon: "mdi-tag-multiple"
            },
            {
                title: '修改时间',
                icon: "mdi-clock-time-nine"
            },
            {
                title: '大小',
                icon: "mdi-file-chart"
            }
        ]
    },
    {
        name: '排列顺序',
        modelName: 'sequence',
        list: [
            {
                title: '升序',
                icon: "mdi-sort-alphabetical-ascending"
            },
            {
                title: '降序',
                icon: "mdi-sort-alphabetical-descending"
            }
        ]
    },
    {
        name: '文件夹前置',
        modelName: 'folderFirst',
        list: [
            {
                title: '禁用',
                icon: "mdi-file"
            },
            {
                title: '启用',
                icon: "mdi-folder"
            }
        ]
    }

]

const currentFileTableForRender = computed<fileTable['items']>(() => {
    if (!currentFileTable.value) {
        return []
    }
    // 数组浅拷贝
    let res = [...currentFileTable.value.items]
    // 这里的所有排序均为升序
    switch (viewOptions.sortBy) {
        case 0:
            res.sort((a, b) => {
                return a.name > b.name ? 1 : -1
            })
            break
        case 1:
            res.sort((a, b) => {
                return a.meta.modifiedTime > b.meta.modifiedTime ? 1 : -1
            })
            break
        case 2:
            res.sort((a, b) => {
                return a.meta.size > b.meta.size ? 1 : -1
            })
            break
    }

    // 降序排序
    if (viewOptions.sequence === 1) {
        res.reverse()
    }
    // 文件夹优先
    if (viewOptions.folderFirst) {
        // NOTE: ES2019已经要求sort为稳定排序，没必要这样先展开再合并
        res = [...res.filter(item => item.type === "folder"), ...res.filter(item => item.type === "file")]
    }
    // 不显示隐藏文件
    if (!viewOptions.showHiddenItem) {
        res = res.filter(item => item.name[0] !== ".")
    }
    return res
})

// <杂项>
const copyToClipboard = (arg: string) => {
    navigator.clipboard.writeText(arg)
    emitter.emit("showMsg", { level: 'success', msg: '复制成功' })
}

const DialogMgrRef = ref(null)

// <缩略图>
const thumbnails = ref({})

const loadThumbnails = async () => {
    if (!viewOptions.showThumbnails) {
        thumbnails.value = {}
        return
    }
    if (await props.adapter.exists(".thumbnails")) {
        const foo = await props.adapter.readFile(".thumbnails")
        thumbnails.value = JSON.parse(foo.toString())
    }
}

const getThumbnail = async (filePath: string): Promise<Buffer> => {
    let thumbnail = null
    const quality = 50

    try {
        thumbnail = await (await Electron
            .nativeImage
            .createThumbnailFromPath(filePath, { height: 128, width: 128 }))
            .toJPEG(quality)

        if (thumbnail) {
            return thumbnail
        } else {
            error("生成缩略图失败，缩略图数据无效（falsy）")
        }
    } catch (e) {
        error("生成缩略图失败" + e.message)
    }
}

const saveThumbnailFile = async () => {
    await props.adapter.writeFile(".thumbnails", JSON.stringify(thumbnails.value))
}

const addThumbnail = async (key: string, thumbnail: Buffer) => {
    if (thumbnail) {
        thumbnails.value[key] = thumbnail.toString('base64')
        await saveThumbnailFile()
    }
}

const deleteThumbnail = async (key: string) => {
    delete thumbnails.value[key]
    await saveThumbnailFile()
}

// <文件选择>
const selectedItems = ref<Set<dirSingleItem>>(new Set())

const handleItemSelection = (item: dirSingleItem) => {
    selectedItems.value.add(item)
}

const handleItemUnselection = (item: dirSingleItem) => {
    selectedItems.value.delete(item)
}

const selectAll = () => {
    selectedItems.value = new Set(currentFileTableForRender.value)
}

const unSelectAll = () => {
    selectedItems.value.clear()
}

const reverseSelection = () => {
    const reversed = currentFileTableForRender.value.filter((item) => {
        return !selectedItems.value.has(item)
    })
    selectedItems.value = new Set(reversed)
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.v-breadcrumbs-item {
    font-size: 14px !important;
    margin: -10px;
}

#file_mgr_container {
    // css最新的容器查询特性，热乎！
    container-type: inline-size;
    height: 100%;
}

.viewSelectorText {
    font-size: small;
    margin-left: 15px;
}

/* 可以为进入和离开动画设置不同的持续时间和动画函数 */
.file-item-transition-enter-active {
    transition: all 0.15s ease-out;
}

.file-item-transition-leave-active {
    transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}

.file-item-transition-enter-from,
.file-item-transition-leave-to {
    transform: translateY(10px);
    opacity: 0;
}
</style>
