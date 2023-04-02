<template>
    <!-- 文件夹 -->
    <v-dialog v-model="folderDialogIsOpen" persistent>
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">新建文件夹</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field label="文件夹名称*" required density="compact" v-model="folderName"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete :items="['读r--', '写-w-', '执行--x']" label="操作权限" multiple
                                density="compact"></v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
                <small>*文件夹名称为必填项</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="folderDialogIsOpen = false">
                    关闭，不保存
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="handleSaveFolder(); folderDialogIsOpen = false">
                    保存
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 文件 -->
    <v-dialog v-model="fileDialogIsOpen" persistent>
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">新建文件</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field label="文件名称*" required density="compact" v-model="fileName"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-autocomplete :items="['读r--', '写-w-', '执行--x']" label="操作权限" multiple
                                density="compact"></v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
                <small>*文件名称为必填项</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="fileDialogIsOpen = false">
                    关闭，不保存
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="handleSaveFile(); fileDialogIsOpen = false">
                    保存
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: 'DialogMgr',
    props: {
        adapter: Object,
        refresh: Function
    },
    data() {
        return {
            fileDialogIsOpen: false,
            folderDialogIsOpen: false,
            fileName: "new file",
            folderName: "new folder"
        }
    },
    methods: {
        showAddFolderDialog() {
            this.folderDialogIsOpen = true
        },
        showAddFileDialog() {
            this.fileDialogIsOpen = true
        },
        handleSaveFile() {
            this.adapter.writeFile(this.fileName, Buffer.from(''))
            this.refresh()
        },
        handleSaveFolder() {
            this.adapter.mkdir(this.folderName)
            this.refresh()
        }
    }
    // mounted() {

    // }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.v-card {
    padding: 15px;
}
</style>
