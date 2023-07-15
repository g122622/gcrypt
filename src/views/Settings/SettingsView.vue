<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="设置">
            <IconBtn icon="mdi-cog-refresh" @click="resetSettings" tooltip="重置所有设置" />
        </ActionToolBarBase>
    </Teleport>

    <v-col id="container">
        <div v-for="category in cats" :key="category">
            <v-card class="rounded-lg">
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
                                    :max="item.extra.maxLimitation" :min="item.extra.minLimitation">
                                </v-slider>
                            </div>
                            <!-- 文本 -->
                            <div v-else-if="item.type === SettingTypes.text">
                                <IconBtn icon="mdi-open-in-new" tooltip="打开并编辑" variant="plain" @click="handleText(item)">
                                </IconBtn>
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
import emitter from "../../eventBus";
import ActionToolBarBase from "@/components/shared/ActionToolBarBase.vue";
import { computed, toRefs } from "vue";
import SettingTypes from "@/types/settingTypes"
import { useSettingsStore } from "@/store/settings"
import settingItem from "@/types/settingItem";
import File from "@/api/File";
import fileTypes from "@/types/fileTypes";
const settingsStore = useSettingsStore()

const resetSettings = () => {
    emitter.emit("resetSettings")
}

const extractByCat = (category) => {
    return settingsStore.settings.filter((item) => { return item.category === category })
}

const handleFile = (file, targetSettingName) => {
    if (file) {
        const reader = new FileReader()
        reader.onload = function () {
            const resBase64 = this.result.toString(); // 获取数据
            if (resBase64) {
                // 修改对应设置&apply
                settingsStore.setSetting(targetSettingName, resBase64)
                settingsStore.saveSettings()
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
        fileTypeArg: 'txt'
    })
}

const cats = computed(() => {
    const settings = settingsStore.settings
    const res = settings.map(item => {
        return item.category
    }).filter(function (item, index, arr) {
        return arr.indexOf(item) === index; // 数组去重
    })
    return res
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#container {
    display: flex;
    flex-wrap: wrap;

    >div {
        min-width: 300px;
        margin: 5px;
        flex-grow: 1;
    }
}
</style>
