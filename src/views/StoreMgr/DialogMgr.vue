<template>
    <!-- 输入密码 -->
    <v-dialog v-model="passwordDialogIsOpen" persistent>
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">输入密码</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field label="密码*" required density="compact" v-model="password"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
                <small>*密码为必填项</small>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="passwordDialogIsOpen = false">
                    取消
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="handlePassword(); passwordDialogIsOpen = false">
                    确定
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 新建加密库 -->
    <v-dialog v-model="addStoreDialogIsOpen" persistent>
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">新建加密库</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-col cols="12">
                        <small>选择文件夹</small>
                        <v-text-field label="目录" required density="compact" v-model="storeSrc"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <small>加密库名</small>
                        <v-text-field label="加密库名" required density="compact" v-model="storeName"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <small>加密库密码</small>
                        <v-text-field label="加密库密码" required density="compact" v-model="password"></v-text-field>
                    </v-col>
                    <v-col cols="12">
                        <small>加密库配置</small>
                        <v-autocomplete :items="['jsonStorage']" label="存储引擎" multiple
                            density="compact"></v-autocomplete>
                        <v-autocomplete :items="['gcryptV1']" label="adapter" multiple
                            density="compact"></v-autocomplete>
                    </v-col>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="addStoreDialogIsOpen = false">
                    取消
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="handleAddStore(); addStoreDialogIsOpen = false">
                    确定
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
    },
    data() {
        return {
            addStoreDialogIsOpen: false,
            passwordDialogIsOpen: false,
            storeSrc: null,
            storeName: null,
            password: null
        }
    },
    methods: {
        showPasswordDialog() {
            this.passwordDialogIsOpen = true
        },
        showAddStoreDialog() {
            this.addStoreDialogIsOpen = true
        },
        handlePassword() {
            this.$parent.handlePassword(this.password)
        },
        handleAddStore() {
            this.$parent.handleAddStore(this.storeSrc, this.storeName, this.password)
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
