<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="设置">
            <IconBtn icon="mdi-content-save" @click="settingsStore.saveSettings()" tooltip="手动保存设置（app会自动保存设置，一般情况不用点）" />
            <IconBtn icon="mdi-update" @click="updateSettings" tooltip="升级所有设置（保留数据）" />
            <IconBtn icon="mdi-cog-refresh" @click="resetSettings" tooltip="重置所有设置" />
        </ActionToolBarBase>
    </Teleport>

    <!-- 搜索框 -->
    <AdvancedTextField v-model:current-input="searchWord" label="搜索..." prepend-inner-icon="mdi-magnify" density="compact"
        style="border-radius: 15px;overflow: hidden;margin: 15px;margin-bottom: 0px;">
    </AdvancedTextField>

    <v-col id="settings-container">
        <div v-for="category in cats" :key="category">
            <v-card style="border-radius: 15px !important;">
                <v-list lines="two">
                    <v-list-subheader v-if="category">{{ category }}</v-list-subheader>
                    <v-list-subheader v-else>未分组</v-list-subheader>
                    <v-list-item v-for="item in extractByCat(category)" :key="item.name" :title="item.title"
                        :subtitle="item.des || '暂无描述'">
                        <template v-slot:append>
                            <!-- 开关 -->
                            <div v-if="item.type === SettingTypes.switcher">
                                <v-switch v-model="item.value" color="primary" density="compact" />
                            </div>
                            <!-- 按钮 -->
                            <div v-else-if="item.type === SettingTypes.button" :onclick="item.value">
                                <v-btn type="primary" size="small" color="primary">触发</v-btn>
                            </div>
                            <!-- 图片 -->
                            <div v-else-if="item.type === SettingTypes.img" style="width:155px;">
                                <v-file-input show-size accept="image/png, image/jpeg, image/bmp" label="选择图片"
                                    @update:modelValue="(files) => {
                                        handleFile(files[0], item.name)
                                    }" density="compact"></v-file-input>
                            </div>
                            <!-- 滑动条 -->
                            <div v-else-if="item.type === SettingTypes.slider" style="width:155px;">
                                <!-- TS类型限制，只能把v-model展开 -->
                                <v-slider thumb-label="always" color="primary" :modelValue="item.value.toString()"
                                    @update:modelValue="newValue => { item.value = newValue.toString() }"
                                    :max="item.extra.maxLimitation" :min="item.extra.minLimitation" :step="item.extra.step">
                                </v-slider>
                            </div>
                            <!-- 文本 -->
                            <div v-else-if="item.type === SettingTypes.text">
                                <IconBtn icon="mdi-open-in-new" tooltip="打开并编辑" variant="plain" @click="handleText(item)">
                                </IconBtn>
                            </div>
                            <!-- 颜色 -->
                            <div v-else-if="item.type === SettingTypes.color" style="display: flex; align-items: center;">
                                <div style="display: inline-block;width:1rem;height: 1rem;border-radius: 50%;margin-right: 10px;"
                                    :style="{ backgroundColor: item.value }" div></div>
                                {{ item.value }}
                                <v-menu :close-on-content-click="false" location="end">
                                    <template v-slot:activator="{ props }">
                                        <v-btn icon v-bind="props" size="small" style="margin-left: 7px;">
                                            <v-icon>
                                                mdi-eyedropper
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <v-card width="300" height='500'>
                                        <!-- 主内容 -->
                                        <v-color-picker show-swatches :modelValue="item.value.toString()"
                                            @update:modelValue="newValue => { item.value = newValue.toString() }"></v-color-picker>
                                    </v-card>
                                </v-menu>
                            </div>
                        </template>

                    </v-list-item>
                </v-list>
            </v-card>
        </div>
        <BottomTip></BottomTip>
    </v-col>
</template>

<script setup lang="ts">
import emitter from "@/eventBus";
import ActionToolBarBase from "@/components/shared/ActionToolBarBase.vue";
import { computed, toRefs, ref } from "vue";
import SettingTypes from "@/types/settingTypes"
import { useSettingsStore } from "@/store/settings"
import settingItem from "@/types/settingItem";
import File from "@/api/File";
import AdvancedTextField from "@/components/shared/AdvancedTextField.vue";
const settingsStore = useSettingsStore()

const searchWord = ref("")
const filteredSettings = computed(() => {
    return searchWord.value ? settingsStore.settings.filter(item => item.title.includes(searchWord.value) || item.des.includes(searchWord.value)) : settingsStore.settings
})

const resetSettings = () => {
    emitter.emit("resetSettings")
}

const updateSettings = () => {
    settingsStore.updateSettings()
}

const extractByCat = (category) => {
    return filteredSettings.value.filter((item) => { return item.category === category })
}

const handleFile = (file, targetSettingName) => {
    if (file) {
        const reader = new FileReader()
        reader.onload = function () {
            const resBase64 = this.result.toString(); // 获取数据
            if (resBase64) {
                // 修改对应设置&apply
                settingsStore.setSetting(targetSettingName, resBase64)
            } else {
                console.error("读取base64失败");
                emitter.emit('showMsg', { level: "error", msg: "读取base64失败" });
            }
        };
        reader.readAsDataURL(file)
    }
}

const handleText = (item: settingItem) => {
    const file = new File()
    file.fromRef(toRefs(item).value)
    emitter.emit('openFile', {
        fileArg: file,
        fileTypeArg: 'json'
    })
}

const cats = computed(() => {
    const res = filteredSettings.value.map(item => {
        return item.category
    }).filter(function (item, index, arr) {
        return arr.indexOf(item) === index; // 数组去重
    })
    return res
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
#settings-container {
    display: flex;
    flex-wrap: wrap;

    >div {
        min-width: 300px;
        margin: 5px;
        flex-grow: 1;
    }

    .v-input__details {
        display: none !important;
    }
}
</style>
