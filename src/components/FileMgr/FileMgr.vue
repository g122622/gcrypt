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

    <div id="file_mgr_container" @dragover="e => e.preventDefault()" @drop="e => handleExtDrop(e)">
        <v-app>
            <!-- 顶部工具栏 -->
            <v-app-bar density="compact">
                <!-- 导航按钮组 -->
                <IconBtn icon="mdi-arrow-left" tooltip="后退" @click="back()"></IconBtn>
                <IconBtn icon="mdi-arrow-up" tooltip="上一级目录" @click="up()"></IconBtn>
                <!-- 布局按钮组 -->
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>mdi-view-module</v-icon>
                            <v-tooltip activator="parent" location="bottom">布局选项</v-tooltip>
                        </v-btn>
                    </template>
                    <v-card>
                        <v-list lines="one" width="400px">
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
                <IconBtn icon="mdi-import" tooltip="从外部引入文件" @click="handleFileImportClick()">
                    <input type="file" id='file-import' style="display: none;" multiple />
                </IconBtn>
                <!-- 导出按钮 -->
                <IconBtn icon="mdi-export-variant" tooltip="导出文件" @click="handleFileExport()"
                    :disabled="!selectedItems.size"></IconBtn>
                <!-- 地址栏 -->
                <div style="margin-left: 15px;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">
                    <v-icon>mdi-map-marker</v-icon>
                    <v-tooltip activator="parent" location="bottom">{{ `当前目录: ` + currentDir.toPathStr() }}</v-tooltip>
                    <v-breadcrumbs :items="currentDir.toBreadcrumbs()" density="compact" style="display: inline;">
                    </v-breadcrumbs>
                </div>
                <v-spacer></v-spacer>
                <!-- 刷新按钮 -->
                <IconBtn icon="mdi-refresh" tooltip="刷新内容" @click="refresh()"></IconBtn>
            </v-app-bar>

            <!-- 主内容区 -->
            <v-main style="display: block; height: 100%;">
                <div style="overflow-y: scroll;overflow-x: hidden;"
                    :style="{ height: props.height ?? 'calc(100% - 63px)' }">
                    <!-- 文件列表 -->
                    <template v-if="currentFileTableForRender.length > 0 && !isLoading">
                        <!-- <TransitionGroup name="file-item-transition"> -->
                        <FileItem :viewOptions="viewOptions" :singleFileItem="item" :index="index"
                            @dblclick="handleItemDoubleClick(item)" :adapter="props.adapter"
                            @selected="handleItemSelection(item)" @unselected="handleItemUnselection(item)"
                            :isSelected="selectedItems.has(item)" v-for="(item, index) in currentFileTableForRender"
                            :key="item.key">
                            <ContextMenu :width="200" :menuList="getItemMenuList(item)" v-if="options.useCtxMenu">
                            </ContextMenu>
                        </FileItem>
                        <!-- </TransitionGroup> -->
                    </template>
                    <div v-else-if="currentFileTableForRender.length === 0 && !isLoading"
                        style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
                        <img src="./assets/fileMgr/404.png" style="width:270px;" />
                        当前目录下没有文件
                    </div>
                    <div v-else style="display: flex;flex-direction: column;align-items: center;margin-top: 20px;">
                        <v-progress-circular indeterminate color="primary" bg-color="rgba(0,0,0,0)"></v-progress-circular>
                    </div>
                    <BottomTip></BottomTip>
                    <ContextMenu :width="200" v-if="options.useCtxMenu" :menuList="[
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
                    <ClipBoard ref="ClipBoardRef" :adapter="adapter" :current-dir="currentDir"
                        :selected-items="selectedItems"></ClipBoard>
                </BottomBar>
            </v-main>
        </v-app>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onMounted } from "vue";
import Addr from "@/api/core/common/Addr";
import getFileName from "@/utils/file/getFileName";
import lodash from "lodash";
import DirSingleItem from "@/api/core/types/DirSingleItem";
import FileTable from "@/api/core/types/FileTable";
import emitter from "@/eventBus";
import AdapterBase from "@/api/core/types/AdapterBase";
import File from "@/api/File";
import getExtName from "@/utils/file/getExtName";
import { useTaskStore } from '@/store/task'
import Task from "@/api/Task";
import sharedUtils from "@/utils/sharedUtils";
import prettyBytes from "@/utils/prettyBytes";
import notification from "@/api/notification";
import pickFile from "@/utils/shell/pickFile";
import { FileMgrOptions } from "./types/FileMgrOptions"
import getWindowsShortcutProperties from 'get-windows-shortcut-properties'
import path from 'path'

import ContextMenu from "../shared/ContextMenu.vue";
import FileItem from "./FileItem.vue";
import DialogMgr from "./DialogMgr.vue";
import BottomBar from "./BottomBar.vue";
import ClipBoard from "./ClipBoard.vue";
import { ViewOptions } from "./types/ViewOptions";
import { warn } from "@/utils/gyConsole";

interface Props {
    adapter: AdapterBase,
    height?: string,
    options?: FileMgrOptions,
    selectedItems?: Set<DirSingleItem>,
    directory?: Addr
}
const props = defineProps<Props>()
const emit = defineEmits(['update:selectedItems'])
const taskStore = useTaskStore()
const isLoading = ref<boolean>(true)
const currentFileTable = ref<FileTable>(null)
const currentDir = ref(new Addr(""))
const operationHistory = ref<Addr[]>([])
const itemCache = ref(null)
const models = reactive({
    isPropOpening: false,
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
const ClipBoardRef = ref()

// <生命周期&初始化>
const initAll = async () => {
    isLoading.value = true
    console.log("FileMgr.vue-1")

    await gotoDir(props.adapter.getCurrentDirectory(), true)
    console.log("FileMgr.vue-2")
    watch(viewOptions, (newVal, oldVal) => {
        // 保存viewOptions
        console.log("FileMgr.vue-3")
        tryToSaveViewOptions(oldVal).then(() => {
            console.log("FileMgr.vue-4")
        })
    }, { deep: true })

    isLoading.value = false
}

const mergeOptions = () => {
    const defaultOptions = {
        useCtxMenu: true,
        onlyAllowFolderSelection: false,
        allowMultipleSelection: true,
        exposeSelection: false,
        useThumbnails: true,
        allowSavingViewOptions: true
    } as FileMgrOptions
    return { ...defaultOptions, ...props.options }
}

const options = reactive(mergeOptions())

onMounted(async () => {
    await initAll()
})

// <核心功能-文件相关>
watch(() => props.directory, async (newVal) => {
    if (newVal) {
        await gotoDir(newVal, true)
    }
}, { immediate: true })

const gotoDir = async (arg: Addr, pushHistory: boolean) => {
    isLoading.value = true
    // 保存布局选项
    console.log("[2]FileMgr.vue-1")

    await tryToSaveViewOptions()
    console.log("[2]FileMgr.vue-2")

    // adapter切换当前目录
    await props.adapter.changeCurrentDirectory(arg)
    console.log("[2]FileMgr.vue-3")

    // 更改currentFileTable
    currentDir.value = arg
    console.log("[2]FileMgr.vue-4")

    currentFileTable.value = await props.adapter.getCurrentFileTable()
    console.log("[2]FileMgr.vue-5")

    // 加载新的布局选项
    await tryToGetAndApplyViewOptions()
    console.log("[2]FileMgr.vue-6")

    // 取消选择的所有item
    selectedItems.value.clear()
    console.log("[2]FileMgr.vue-7")

    if (pushHistory) {
        console.log("[2]FileMgr.vue-8")
        operationHistory.value.push(lodash.cloneDeep(arg))
        console.log("[2]FileMgr.vue-9")
    }
    isLoading.value = false
}

const refresh = async () => {
    await gotoDir(currentDir.value, false)
    notification.success("刷新成功")
}

const up = () => {
    if (currentDir.value.isRoot()) {
        notification.warning("已经是根目录了")
        return
    }
    gotoDir(currentDir.value.up(), true)
}

const back = () => {
    if (operationHistory.value.length >= 2) {
        operationHistory.value.pop()
        gotoDir(operationHistory.value.pop(), true)
    }
}

const openFile = (filename, fileguid) => {
    // 先判断是否为快捷方式，是的话则跳转
    if (process.platform === 'win32' && getExtName(filename) === 'lnk') {
        const output = getWindowsShortcutProperties.sync(path.join(currentDir.value.toPathStr(), filename));
        if (output) {
            gotoDir(new Addr(output[0].TargetPath), true)
            return
        }
    }

    const fileArg = new File(fileguid)
    fileArg.fromAdapter(props.adapter, filename)

    emitter.emit('openFile', {
        fileArg,
        fileTypeArg: getExtName(filename)
    })
}

const importFile = async (files: FileList) => {
    if (files.length === 0) {
        return
    }
    const taskGroupId = sharedUtils.getHash(16)
    for (const file of files) {
        taskStore.addTask(new Task(async () => {
            let fileKey: string
            // 读文件
            const reader = new FileReader();
            reader.onload = async function (evt) {
                const dataBuf: Buffer = Buffer.from(evt.target.result as ArrayBuffer)
                fileKey = await props.adapter.writeFile(getFileName(file.path, true), dataBuf)
                // 处理缩略图相关逻辑
                if (options.useThumbnails && props.adapter.setExtraMeta) {
                    await props.adapter.setExtraMeta(fileKey, 'fileOriginalPath', Buffer.from(file.path))
                }
            }
            reader.readAsArrayBuffer(file);
        }, `引入文件 ${file.path}`, taskGroupId), { runImmediately: false })
    }
    try {
        await taskStore.runTaskGroup(taskGroupId)
        notification.success(`导入${files.length}个文件成功`)
    } catch (error) {
        emitter.emit("showMsg",
            {
                level: "error",
                msg: `导入文件失败 ${error.message}`
            })
    } finally {
        await refresh()
    }
}

const deleteFile = async () => {
    if (selectedItems.value.size === 0) {
        return
    }
    const taskGroupId = sharedUtils.getHash(16)
    for (const item of selectedItems.value) {
        taskStore.addTask(new Task(async () => {
            await props.adapter.deleteFile(item.name)
        }, `删除文件 ${item.name}`, taskGroupId), { runImmediately: false })
    }
    try {
        await taskStore.runTaskGroup(taskGroupId)
    } catch (error) {
        emitter.emit("showMsg",
            {
                level: "error",
                msg: `删除文件失败 ${error.message}`
            })
        return
    } finally {
        await refresh()
    }
    notification.success(`删除文件成功`)
}

const renameFile = async (oldname, newname) => {
    if (props.adapter.renameFile) {
        taskStore.addTask(new Task(async () => {
            await props.adapter.renameFile(oldname, newname)
        }, `重命名文件 ${oldname} -> ${newname}`), { runImmediately: true })
    }
}

// <UI>
const handlePropertiesClick = (item?: DirSingleItem) => {
    if (item) {
        itemCache.value = { ...item, ...item.meta }
        delete itemCache.value.meta
        models.isPropOpening = true
    } else {
        let totalSize = 0
        for (let element of selectedItems.value) {
            if (element.meta.size > 0) {
                totalSize += element.meta.size
            }
        }
        itemCache.value = {
            totalSize,
            totalSizeFormatted: prettyBytes(totalSize)
        }
        models.isPropOpening = true
    }
}

const handleItemDoubleClick = (item) => {
    if (item.type === "folder") {
        gotoDir(currentDir.value.down(item.name), true)
    } else if (item.type === "file") {
        openFile(item.name, item.key)
    }
}

const getItemMenuList = (item) => {
    if (selectedItems.value.size <= 1) {
        return [
            {
                text: '打开', icon: 'mdi-open-in-new', actions: { onClick: () => { handleItemDoubleClick(item) } }
            },
            {
                type: 'divider'
            },
            {
                text: '符号链接', icon: 'mdi-link-variant-plus', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('symlink') } }
            },
            {
                text: '复制', icon: 'mdi-content-copy', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('copy') } }
            },
            {
                text: '移动', icon: 'mdi-file-move-outline', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('move') } }
            },
            {
                text: '删除', icon: 'mdi-delete', actions: { onClick: () => { deleteFile() } }
            },
            {
                text: '重命名', icon: 'mdi-rename-box', actions: { onClick: () => { DialogMgrRef.value.showRenameFileDialog(item.name) } }
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
                text: '符号链接', icon: 'mdi-link-variant-plus', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('symlink') } }
            },
            {
                text: '复制', icon: 'mdi-content-copy', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('copy') } }
            },
            {
                text: '移动', icon: 'mdi-file-move-outline', actions: { onClick: () => { ClipBoardRef.value.addSelectedItemsToClipBoard('move') } }
            },
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
    let foo: HTMLInputElement = document.querySelector("#file-import")
    foo.click()
    foo.onchange = async () => {
        await importFile(foo.files)
    }
}

// <外观选择相关>
const viewOptions = ref<ViewOptions>({
    itemDisplayMode: 1, // 0 list, 1 item
    itemSize: 5, // 区间[0,10]的整数, '5' stands for medium size
    sortBy: 0, // 0 name, 1 timeModify
    folderFirst: 1,
    sequence: 0, // 0 ascending | 1 descending
    showHiddenItem: 1,
    showExtName: 1,
    showThumbnails: 1
})

/**
 * 尝试保存布局选项
 */
const tryToSaveViewOptions = async (optionsIn?: ViewOptions) => {
    if (!props.adapter.setExtraMeta || !options.allowSavingViewOptions || !currentFileTable.value) {
        return
    }
    console.log("FileMgr.vue-5")
    try {
        await props.adapter.setExtraMeta(
            currentFileTable.value.selfKey,
            'viewOptions',
            Buffer.from(JSON.stringify(viewOptions.value ?? optionsIn)))
        console.log("FileMgr.vue-6-final")
    } catch (e) {
        warn('尝试保存布局选项失败' + e.toString())
    }
}

/**
 * 尝试加载布局选项
 */
const tryToGetAndApplyViewOptions = async () => {
    if (!props.adapter.getExtraMeta || !options.allowSavingViewOptions) {
        return
    }
    try {
        const obj = JSON.parse((await props.adapter.getExtraMeta(currentFileTable.value.selfKey, 'viewOptions')).toString())
        if (obj) {
            viewOptions.value = obj
        }
    } catch (e) {
        warn('尝试加载布局选项失败' + e.toString())
    }
}

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
            },
            {
                title: '看图模式',
                icon: "mdi-image"
            }
        ]
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
    },
    {
        name: '显示缩略图',
        modelName: 'showThumbnails',
        list: [
            {
                title: '禁用',
                icon: "mdi-image-off"
            },
            {
                title: '启用',
                icon: "mdi-image"
            }
        ]
    },
    {
        name: '显示隐藏文件',
        modelName: 'showHiddenItem',
        list: [
            {
                title: '禁用',
                icon: "mdi-eye-off"
            },
            {
                title: '启用',
                icon: "mdi-eye"
            }
        ]
    }

]

const currentFileTableForRender = computed<FileTable['items']>(() => {
    if (!currentFileTable.value) {
        return []
    }
    // 数组浅拷贝
    let res = [...currentFileTable.value.items]
    // 这里的所有排序均为升序
    switch (viewOptions.value.sortBy) {
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
    if (viewOptions.value.sequence === 1) {
        res.reverse()
    }
    // 文件夹优先
    if (viewOptions.value.folderFirst) {
        // NOTE: ES2019已经要求sort为稳定排序，没必要这样先展开再合并
        res = [...res.filter(item => item.type === "folder"), ...res.filter(item => item.type === "file")]
    }
    // 不显示隐藏文件
    if (!viewOptions.value.showHiddenItem) {
        res = res.filter(item => item.name[0] !== ".")
    }
    return res
})

// <杂项>
const copyToClipboard = (arg: string) => {
    navigator.clipboard.writeText(arg)
    notification.success("复制成功")
}

const DialogMgrRef = ref(null)

// <文件选择>
let selectedItems = null
if (options.exposeSelection) {
    selectedItems = computed<Set<DirSingleItem>>({
        get() {
            return props.selectedItems
        },
        set(value) {
            emit("update:selectedItems", value)
        }
    })
} else {
    selectedItems = ref<Set<DirSingleItem>>(new Set())
}

const handleItemSelection = (item: DirSingleItem) => {
    if (!options.allowMultipleSelection && selectedItems.value.size > 0) return
    if (options.onlyAllowFolderSelection && item.type !== "folder") return
    selectedItems.value.add(item)
}

const handleItemUnselection = (item: DirSingleItem) => {
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

// <文件拖放>
const handleExtDrop = async (event) => {
    event.preventDefault()
    await importFile(event.dataTransfer.files)
}

// <文件导出>
const handleFileExport = async () => {
    try {
        const directory = (await pickFile(null, true, false, true))[0]
        selectedItems.value.forEach(item => {
            const file = new File()
            file.fromAdapter(props.adapter, item.name)
            file.exportToExt(directory)
        })
    } catch (e) { }
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
    width: 100%;
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

#file_mgr_container .v-application__wrap {
    min-height: v-bind("props.height ? 'unset' : '100vh'");
}
</style>
