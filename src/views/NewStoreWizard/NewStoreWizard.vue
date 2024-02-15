<template>
    <v-app>
        <v-main>
            <Transition></Transition>
            <v-container v-if="currentStage === 1">
                <v-row align="start" no-gutters style="height: 150px;">
                    <v-col v-for="item in storeTypes" :key="item.type">
                        <div class="store-type-container" @click="currentStoreType = item.type; currentStage = 2">
                            <v-icon>{{ item.img }}</v-icon>
                            {{ item.name }}
                        </div>
                    </v-col>
                </v-row>
            </v-container>
            <v-container v-if="currentStage === 2">
                <v-col cols="12">
                    <small>加密库配置</small>
                    <v-autocomplete :items="['KVPEngineJson', 'KVPEngineFolder', 'KVPEngineHybrid']" label="存储引擎"
                        density="compact" v-model="currentKVPEngine"></v-autocomplete>
                    <v-autocomplete :items="['gcryptV1']" label="adapter" density="compact"
                        v-model="currentAdapter"></v-autocomplete>
                    <v-autocomplete :items="['encryptionEngineAES192', 'EncryptionEngineNoop']" label="加密引擎"
                        density="compact" v-model="currentEncryptionEngine"></v-autocomplete>
                </v-col>
                <v-btn variant="tonal" @click="isEngineConfirmed = true" prepend-icon="mdi-check">
                    确定
                </v-btn>
            </v-container>
            <v-container v-if="currentStage === 3">
                <v-col cols="12">
                    <small>入口点entry.js位置</small>
                    <v-text-field label="目录" required density="compact" v-model="storeFolderSrc"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <small>加密库名</small>
                    <v-text-field label="加密库名" required density="compact" v-model="storeName"></v-text-field>
                </v-col>
                <v-col cols="12">
                    <small>加密库密码</small>
                    <v-text-field label="加密库密码" required density="compact" v-model="password"></v-text-field>
                </v-col>
                <v-btn variant="tonal" @click="isInfoConfirmed = true" prepend-icon="mdi-check">
                    确定
                </v-btn>
            </v-container>
        </v-main>
        <v-footer>
            <!-- 进度指示器 -->
            <v-timeline side="end" direction="horizontal">
                <v-timeline-item v-for="(item, index) in  progressLineItems " :key="item.stage"
                    :dot-color="index + 1 === currentStage ? 'error' : 'info'" size="small">
                    <v-alert :value="true" color="info">
                        {{ item.title }}
                    </v-alert>
                </v-timeline-item>
            </v-timeline>
        </v-footer>
    </v-app>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue"
import { useEncryptionStore } from "@/store/encryption";
import fs from "fs-extra";
import EntryJson from "@/api/core/types/EntryJson";
const encryptionStore = useEncryptionStore()

const progressLineItems = [
    { stage: 1, title: "选择存储库类型" },
    { stage: 2, title: "选择engine" },
    { stage: 3, title: "输入密码和其他信息" },
    { stage: 4, title: "完成" },
]
const currentStage = ref(1)

// { stage: 1, title: "选择存储库类型" },
const currentStoreType = ref('')

const storeTypes = [
    { type: 'local', name: '本地存储库', img: 'mdi-harddisk' },
    { type: 'network', name: '网络存储库', img: 'mdi-earth' }
]

// { stage: 2, title: "选择engine" },
const currentKVPEngine = ref("")
const currentAdapter = ref("")
const currentEncryptionEngine = ref("")
const isEngineConfirmed = ref(false)

watchEffect(() => {
    if (currentKVPEngine.value && currentAdapter.value && isEngineConfirmed.value) {
        currentStage.value = 3
    } else {
        isEngineConfirmed.value = false
    }
})

// { stage: 3, title: "输入密码和其他信息" },
const storeFolderSrc = ref("")
const storeName = ref("")
const password = ref("")
const isInfoConfirmed = ref(false)

watchEffect(() => {
    if (storeName.value && storeFolderSrc.value && password.value && isInfoConfirmed.value) {
        currentStage.value = 4
    } else {
        isInfoConfirmed.value = false
    }
})

// { stage: 4, title: "完成" },
const getInitedAdapterForNewStore = async () => {
    // 生成不同adapter统一的entry.json
    let time = Date.now()
    const entryJSON = {
        modifiedTime: time,
        createdTime: time,
        accessedTime: time,
        storageName: storeName.value,
        comment: '',
        storeType: currentStoreType.value,
        config: {
            KVPEngine: currentKVPEngine.value,
            adapter: currentAdapter.value,
            encryptionEngine: currentEncryptionEngine.value
        }
    } as EntryJson

    const entryFileSrc = storeFolderSrc.value + "/entry.json"
    await fs.writeFile(entryFileSrc, JSON.stringify(entryJSON))
    encryptionStore.storeList.push({ ...entryJSON, storeEntryJsonSrc: entryFileSrc })
    encryptionStore.save()

    return await encryptionStore.getInitedAdapter(entryFileSrc, password.value, entryJSON)
}

const handleAddStore = async () => {
    // 格式化文件路径
    let formattedEntryPath = storeFolderSrc.value.replaceAll("\\", '/')
    if (formattedEntryPath[formattedEntryPath.length - 1] === "/") {
        formattedEntryPath = formattedEntryPath.slice(0, formattedEntryPath.length - 1)
    }
    // 用filemgr打开
    await encryptionStore.openStore(formattedEntryPath, await getInitedAdapterForNewStore())
}

watchEffect(() => {
    if (currentStage.value === 4) {
        handleAddStore()
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.store-type-container {
    border-radius: 10px;
    background-color: rgba(131, 131, 131, 0.3);
    color: white;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-evenly;
    transition: 0.25s;
    cursor: pointer;
    height: 150px;
    width: 90%;
    padding: 10px;
    margin: 10px;

    .file-types-image {
        height: 60px;
    }

    .file-thumbnail-img {
        height: 60px;
    }
}

.store-type-container:hover {
    background-color: rgba(131, 131, 131, 0.5);
}
</style>
