<template>
    <div class="file-item" :class="fileItemClassList" v-ripple ref="fileItemElement">
        <v-tooltip activator="parent" location="right" open-delay="500">
            {{ singleFileItem.name }}
        </v-tooltip>
        <!-- 前置内容 -->
        <div style="display: flex;justify-content: flex-start;align-items: center;"
            :style="{ flexDirection: (displayMode === 1 ? 'column' : 'row') }">
            <div v-if="singleFileItem.type === `folder`">
                <img :src="`./assets/fileTypes/folder.png`" class="file-types-image" />
            </div>
            <div v-if="singleFileItem.type === `file`">
                <img v-if="thumbnail" :src="toDataURL(thumbnail)" class="file-thumbnail-img" />
                <img v-else :src="`./assets/fileTypes/${getFileType(singleFileItem.name)}.png`" class="file-types-image" />
            </div>
            <div class="file-name">
                {{ singleFileItem.name }}
            </div>
        </div>

        <!-- 自定义内容插槽 -->
        <slot></slot>

        <!-- 尾置内容 -->
        <div>
            <!-- <IconBtn tooltip="更多" icon="mdi-dots-vertical" :onClick="handleClickMore" /> -->
            <div class="file-meta">
                <div v-if="displayMode === 0">
                    created: {{ new Date(singleFileItem.meta.createdTime).toLocaleString() }}
                    <br />
                    modified: {{ new Date(singleFileItem.meta.modifiedTime).toLocaleString() }}
                </div>
                <div v-else-if="displayMode === 1">
                    {{ new Date(singleFileItem.meta.modifiedTime).toLocaleDateString() }}
                </div>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import dirSingleItem from "@/api/core/types/dirSingleItem";
import getFileType from "@/utils/getFileType";
import { computed } from "vue";
import { useMainStore } from "@/store/main"
const mainStore = useMainStore()

interface Props {
    displayMode: number,
    singleFileItem: dirSingleItem,
    index: number,
    thumbnail: string
}
const props = defineProps<Props>()

const toDataURL = (str: string) => {
    const prefix = 'data:image/jpg;base64,'
    return prefix + str
}

const isHidden = computed(() => {
    return props.singleFileItem.name[0] === "."
})
const fileItemClassList = computed(() => {
    return {
        'file-item-list': props.displayMode === 0,
        'file-item-item': props.displayMode === 1,
        'file-item-hidden': isHidden.value
    }
})
const markerColor = computed(() => {
    if (mainStore.activeFiles.get(props.singleFileItem.key)) {
        if (mainStore.activeFiles.get(props.singleFileItem.key).isUsingTempFile) {
            return '#FFC300'
        }
        if (mainStore.activeFiles.get(props.singleFileItem.key).isOpen) {
            return '#23B6FC'
        }
    }
    return 'none'
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@container (width < 400px) {
    .file-meta {
        display: none;
    }
}

.file-item {
    border-radius: 10px;
    background-color: rgba(131, 131, 131, 0.3);
    overflow: hidden;
    color: white;
    display: flex;
    align-items: center;
    transition: 0.25s;
    cursor: pointer;

    z-index: 1; // 为了全局contextmenu的右键点击激发区域在file-item之下

    position: relative !important; // 为了contextmenu的右键点击激发区域能够顺利溢出隐藏
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
}

.file-item-item {
    float: left;
    height: 130px;
    width: 115px;
    flex-direction: column;
    padding: 10px;
    margin-left: 15px;
    margin-top: 10px;

    .file-types-image {
        height: 60px;
    }

    .file-thumbnail-img {
        height: 60px;
    }
}

.file-item:hover {
    background-color: rgba(131, 131, 131, 0.5);
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

    max-width: 100px;
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
</style>
