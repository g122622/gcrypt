<template>
    <div class="file-item" v-ripple>
        <!-- 前置内容 -->
        <div style="display: flex;
                    justify-content: flex-start;
                    align-items: center;">
            <img v-if="singleFileItem.type === `folder`" :src="`./assets/fileTypes/folder.png`"
                class="file-types-image" />
            <img v-if="singleFileItem.type === `file`"
                :src="`./assets/fileTypes/${getFileType(singleFileItem.name)}.png`" class="file-types-image" />
            <div class="file-name">
                {{ singleFileItem.name }}
            </div>
        </div>
        <!-- 尾置内容 -->
        <div>
            <div class="file-meta">
                created: {{ new Date(singleFileItem.meta.createdTime).toLocaleString() }}
                <br />
                modified: {{ new Date(singleFileItem.meta.modifiedTime).toLocaleString() }}
            </div>
        </div>

    </div>
</template>

<script lang="ts">
import getFileType from "../../utils/getFileType";
import { defineComponent } from "vue"
import emitter from "../../eventBus"

export default defineComponent({
    name: 'FileItem',
    props: {
        displayMode: String,
        singleFileItem: Object,
        index: Number
    },
    // data() {
    //     return {

    //     }
    // },
    // mounted() {

    // }
    methods: {
        getFileType(filename) {
            return getFileType(filename)
        }
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.file-item {
    border-radius: 10px;
    height: 60px;
    background-color: rgba(131, 131, 131, 0.3);
    padding: 15px;
    padding-left: 20px;
    color: white;
    margin: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: 0.25s;
    cursor: pointer;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.file-item:hover {
    background-color: rgba(131, 131, 131, 0.5);
}

.file-types-image {
    width: 30px;
}

.file-meta {
    font-size: 13px;
    color: rgb(145, 145, 145);
}

.file-name {
    font-size: 16px;
    margin-left: 10px;
    margin-right: 10px;
}
</style>
