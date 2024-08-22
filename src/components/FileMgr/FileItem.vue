<template>
    <div class="file-item" :class="fileItemClassList" v-ripple ref="fileItemElement" @click="handleClick()"
        @click.right="handleClick(true)" v-intersect="{
            handler: onIntersect,
            options: {
                threshold: 0
            }
        }" :style="{ opacity: isIntersecting ? 1 : 0 }">
        <!-- 若在视口范围内，则渲染以下组件 -->
        <template v-if="isIntersecting">
            <v-tooltip activator="parent" location="right" open-delay="500">
                {{ `[${index + 1}] ${singleFileItem.name}` }}
            </v-tooltip>
            <!-- 前置内容 -->
            <div style="display: flex;justify-content: flex-start;align-items: center;"
                :style="{ flexDirection: (viewOptions.itemDisplayMode === 0 ? 'row' : 'column') }">
                <template v-if="singleFileItem.type === `folder`">
                    <img :src="`./assets/fileTypes/folder.png`" class="file-types-image" loading="lazy" />
                </template>
                <template v-if="singleFileItem.type === `file`">
                    <img v-if="currentThumbnail" :src="toDataURL(currentThumbnail)" class="file-thumbnail-img"
                        loading="lazy" />
                    <img v-else :src="`./assets/fileTypes/${getFileType(singleFileItem.name)}.png`"
                        class="file-types-image" loading="lazy" />
                </template>
                <template v-if="singleFileItem.type === `file` && !!currentThumbnail">
                    <img :src="`./assets/fileTypes/${getFileType(singleFileItem.name)}.png`"
                        class="file-types-image-corner" loading="lazy" />
                </template>
                <div class="file-name">
                    {{ singleFileItem.name }}
                </div>
            </div>

            <!-- 自定义内容插槽 -->
            <slot></slot>

            <!-- 尾置内容 -->
            <!-- <IconBtn tooltip="更多" icon="mdi-dots-vertical" :onClick="handleClickMore" /> -->
            <div class="file-meta">
                <template v-if="viewOptions.itemDisplayMode === 0">
                    created: {{ new Date(singleFileItem.meta.createdTime).toLocaleString() }}
                    <br />
                    modified: {{ new Date(singleFileItem.meta.modifiedTime).toLocaleString() }}
                </template>
                <template v-else-if="viewOptions.itemDisplayMode === 1 && props.singleFileItem.type === 'file'">
                    {{ prettyBytes(props.singleFileItem.meta.size, 2) }}
                </template>
                <template v-else-if="viewOptions.itemDisplayMode === 1 && props.singleFileItem.type === 'folder'">
                    {{ new Date(singleFileItem.meta.modifiedTime).toLocaleDateString() }}
                </template>
                <template v-else-if="viewOptions.itemDisplayMode === 2 && props.singleFileItem.type === 'file'">
                    {{ prettyBytes(props.singleFileItem.meta.size, 2) }}
                </template>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import DirSingleItem from "@/api/core/types/DirSingleItem";
import getFileType from "@/utils/file/getFileType";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useMainStore } from "@/store/main"
import { useSettingsStore } from "@/store/settings"
import prettyBytes from "@/utils/prettyBytes";
import AdapterBase from "@/api/core/types/AdapterBase";
import { ViewOptions } from "./types/ViewOptions";
import getThumbnailFromSystem from '@/utils/image/getThumbnailFromSystem'
import { warn } from "@/utils/gyConsole";
import sleep from "@/utils/sleep";

interface Props {
    viewOptions: ViewOptions,
    singleFileItem: DirSingleItem,
    index: number,
    adapter: AdapterBase,
    isSelected: boolean
}
const props = defineProps<Props>()
const emit = defineEmits(['selected', 'unselected'])
const mainStore = useMainStore()
const settingsStore = useSettingsStore()
// 由于看图模式下排版存在不稳定性，故不启用虚拟列表
const isIntersecting = ref<boolean>(props.viewOptions.itemDisplayMode === 2)

const toDataURL = (str: string) => {
    const prefix = 'data:image/jpg;base64,'
    return prefix + str
}

const isHidden = computed(() => {
    return props.singleFileItem.name[0] === "."
})

const fileItemClassList = computed(() => {
    return {
        'file-item-dark': settingsStore.getSetting('is_dark'),
        'file-item-light': !settingsStore.getSetting('is_dark'),
        'file-item-list': props.viewOptions.itemDisplayMode === 0,
        'file-item-item': props.viewOptions.itemDisplayMode === 1,
        'file-item-photo': props.viewOptions.itemDisplayMode === 2,
        'file-item-hidden': isHidden.value,
        'file-item-selected': props.isSelected,
    }
})

const markerColor = computed(() => {
    const fileActiveState = mainStore.activeFiles.get(props.singleFileItem.key)
    if (fileActiveState) {
        if (fileActiveState.isUsingTempFile) {
            return '#FFC300'
        }
        if (fileActiveState.isOpen) {
            return '#23B6FC'
        }
    }
    return 'none'
})

const handleClick = (isRightClick = false) => {
    if (props.isSelected) {
        if (!isRightClick) {
            emit("unselected")
        }
    } else {
        emit("selected")
    }
}

const onIntersect = (isIntersectingArg /* , entries, observer */) => {
    if (props.viewOptions.itemDisplayMode === 2) {
        isIntersecting.value = true
        return
    }
    // setTimeout是很重要的优化，降低并发
    setTimeout(() => {
        isIntersecting.value = isIntersectingArg
    }, 0)
}

// <缩略图>
const currentThumbnail = ref<string>('')
let idleCallbackId = null

onMounted(async () => {
    // 自动创建和加载缩略图相关逻辑
    if (props.viewOptions.showThumbnails && props.adapter.getExtraMeta && props.singleFileItem.type === 'file') {
        try {
            const thumbnailBuf = await props.adapter.getExtraMeta(props.singleFileItem.key, 'thumbnail')
            if (thumbnailBuf) {
                const thumbnailStr = thumbnailBuf.toString()
                if (thumbnailStr !== 'n/a') {
                    currentThumbnail.value = thumbnailStr
                }
            } else {
                // 当thumbnailBuf为null
                // 尝试从系统获取缩略图，并保存
                idleCallbackId = requestIdleCallback(async () => {
                    if (!(await props.adapter.hasExtraMeta(props.singleFileItem.key, 'fileOriginalPath'))) {
                        return
                    }
                    let fileOriginalPath = null
                    // 3次尝试从系统获取缩略图，并保存
                    for (let i = 0; i < 3; i++) {
                        try {
                            fileOriginalPath = (await props.adapter.getExtraMeta(props.singleFileItem.key, 'fileOriginalPath')).toString()
                            currentThumbnail.value = await getThumbnailFromSystem(fileOriginalPath, { height: 256, width: 256, quality: 90 })
                            await props.adapter.setExtraMeta(props.singleFileItem.key, 'thumbnail', Buffer.from(currentThumbnail.value))
                            break
                        } catch (e) {
                            warn(`第${i + 1}次从系统获取缩略图失败，错误原因：${e.toString()}，文件在本地系统的路径：${fileOriginalPath}`)
                        }
                        if (i === 2) {
                            await props.adapter.setExtraMeta(props.singleFileItem.key, 'thumbnail', Buffer.from('n/a'))
                            warn(`3次从系统获取缩略图全部失败，文件在本地系统的路径：${fileOriginalPath}`)
                        } else {
                            // 休眠一段时间之后再试
                            await sleep(500)
                        }
                    }
                    // 收尾工作，清理掉fileOriginalPath
                    await props.adapter.deleteExtraMeta(props.singleFileItem.key, 'fileOriginalPath')
                })
            }
        } catch (e) {
            warn('缩略图加载失败:' + e.message)
        }
    }
})

onUnmounted(() => {
    if (idleCallbackId !== null) {
        cancelIdleCallback(idleCallbackId)
    }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@item-background-alpha: 0.3;

@container (width < 400px) {
    .file-meta {
        display: none;
    }
}

.file-item {
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    transition: 0.25s;
    cursor: pointer;
    z-index: 1; // 为了全局contextmenu的右键点击激发区域在file-item之下
    position: relative !important; // 为了contextmenu的右键点击激发区域能够顺利溢出隐藏
}

.file-item-dark {
    color: white;
    background-color: rgba(131, 131, 131, @item-background-alpha);
}

.file-item-light {
    color: black;
    background-color: rgba(255, 255, 255, @item-background-alpha);
    box-shadow: 0 0 7px rgba(0, 0, 0, 0.15);
}

.file-item-dark:hover {
    background-color: rgba(131, 131, 131, 0.5);
}

.file-item-light:hover {
    background-color: rgba(230, 230, 230, 0.5);
}

.file-item-list {
    height: 60px;
    padding-left: 20px;
    justify-content: space-between;
    padding: 15px;
    margin: 10px;

    .file-types-image {
        width: 30px;
    }

    .file-thumbnail-img {
        max-height: 30px;
    }

    .file-name {
        margin-left: 5px;
        margin-right: 5px;
    }

    .file-types-image-corner {
        display: none;
    }
}

.file-item-item {
    float: left;
    height: 120px;
    width: 115px;
    flex-direction: column;
    padding: 10px;
    margin-left: 15px;
    margin-top: 10px;

    .file-types-image {
        height: 60px;
    }

    .file-types-image-corner {
        height: 25px;
        position: absolute;
        bottom: 45px;
        right: 7px;
    }

    .file-thumbnail-img {
        height: 60px;
    }

    .file-name {
        max-width: 100px;
    }
}

.file-item-photo {
    float: left;
    height: 214px;
    // width: 200px;
    flex-direction: column;
    padding: 5px;
    margin-left: 5px;
    margin-top: 5px;
    border-radius: 5px;

    .file-types-image {
        height: 100px;
    }

    .file-types-image-corner {
        height: 30px;
        position: absolute;
        bottom: 25px;
        right: 10px;
    }

    .file-thumbnail-img {
        height: 190px;
    }

    .file-name {
        display: none;
    }
}

.file-item-hidden {
    opacity: 0.35;
}

.file-meta {
    font-size: 13px;
    color: rgb(145, 145, 145);
}

.file-name {
    display: list-item;
    list-style-position: inside;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    font-size: 16px;
    margin-left: 10px;
    margin-right: 10px;
}

.file-name::marker {
    content: v-bind("markerColor === 'none' ? `''` : `'• '`");
    font-weight: 900;
    color: v-bind('markerColor');
}

.file-item-selected {
    background-color: rgba(var(--v-theme-primary), @item-background-alpha);
}
</style>
