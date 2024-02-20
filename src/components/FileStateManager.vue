<template>
    <div class="text-center">
        <v-menu v-model="isMenuOpen" :close-on-content-click="false" location="end">
            <template v-slot:activator="{ props }">
                <v-btn icon v-bind="props" size="small" style="margin-top:10px">
                    <v-icon>
                        mdi-file
                    </v-icon>
                </v-btn>
            </template>

            <v-card width="600" height='400'>
                <!-- 主内容 -->
                <AdvancedList lines="two" subheader="打开的文件" :items="listItems" useBottomTip useSearch
                    v-slot="{ matchedItems }" width="590px" height="215px">
                    <v-list-item v-for="item in matchedItems" :key="item.key" :title="item.key">
                        <template #append>
                            <IconBtn icon="mdi-information" :tooltip="getTooltip(item.value)" size="small" />
                            <IconBtn icon="mdi-close" tooltip="解除占用(inactivate)" size="small"
                                @click="File.inactivateFile(item.key)" />
                        </template>
                    </v-list-item>
                </AdvancedList>
                <v-divider />
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn variant="text" @click="isMenuOpen = false">
                        退出
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="mainStore.inactivateAllFiles()">
                        解除全部
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useMainStore } from "@/store/main"
import FileActiveState from "@/types/FileActiveState";
import File from "@/api/File";

const mainStore = useMainStore()
const isMenuOpen = ref(false)
const listItems = computed(() => {
    let res: { key: string, value: FileActiveState }[] = []
    mainStore.activeFiles.forEach((value, key) => {
        res.push({ key, value })
    })
    return res
})
const getTooltip = (item: FileActiveState) => {
    return `
    isOpen: ${item.isOpen},
    isUsingTempFile: ${item.isUsingTempFile}
    `
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
