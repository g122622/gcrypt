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
                            <AdvancedTextField label="文件夹名称*" v-model:currentInput="folderName" density="compact" required>
                            </AdvancedTextField>
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
                            <AdvancedTextField label="文件名称*" v-model:currentInput="fileName" density="compact" required>
                            </AdvancedTextField>
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

    <!-- 重命名 -->
    <v-dialog v-model="renameDialogIsOpen" persistent>
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">重命名</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <AdvancedTextField label="新的文件名*" v-model:currentInput="newFileName" density="compact" required>
                            </AdvancedTextField>
                        </v-col>
                    </v-row>
                </v-container>
                <small>*新的文件名为必填项</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="renameDialogIsOpen = false">
                    关闭，不保存
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="handleRenameFile(); renameDialogIsOpen = false">
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
            renameDialogIsOpen: false,
            fileName: "new file",
            folderName: "new folder",
            oldFileName: "",
            newFileName: ""
        }
    },
    methods: {
        showAddFolderDialog() {
            this.folderDialogIsOpen = true
        },
        showAddFileDialog() {
            this.fileDialogIsOpen = true
        },
        showRenameFileDialog(oldFileName) {
            this.oldFileName = oldFileName
            this.renameDialogIsOpen = true
        },
        async handleSaveFile() {
            await this.adapter.writeFile(this.fileName, Buffer.from(''))
            this.refresh()
        },
        async handleSaveFolder() {
            await this.adapter.mkdir(this.folderName)
            this.refresh()
        },
        async handleRenameFile() {
            await this.adapter.renameFile(this.oldFileName, this.newFileName)
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
