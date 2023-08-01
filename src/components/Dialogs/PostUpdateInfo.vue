<template>
    <DialogGenerator :title="'新版本简介 v' + mainStore.appVersion" v-model:isDialogOpen="isShowing" width="600px"
        :isPersistent="false" :bottomActions="[{ text: '明白', onClick: () => { isShowing = false } }]">
        <template #mainContent>
            <div style="margin-bottom: 25px;">
                <div v-for="item in whatsNew[mainStore.appVersion]" :key="item"> {{ item }} </div>
            </div>
        </template>
        <template #footer>
            <v-switch v-model="displayNextTime" color="primary" density="compact" label="每次启动始终显示" />
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useSettingsStore } from "@/store/settings"
import { useMainStore } from "@/store/main";
import whatsNew from "@/assets/whatsNew";

const settingsStore = useSettingsStore()
const mainStore = useMainStore()
const isShowing = ref<boolean>(false)
const displayNextTime = computed<boolean>({
    get() {
        return settingsStore.getSetting("always_display_update_info")
    },
    set(value) {
        return settingsStore.setSetting("always_display_update_info", value)
    }
})

if ((mainStore.appVersion !== mainStore.appVersionOld) || settingsStore.getSetting("always_display_update_info")) {
    isShowing.value = true
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
