<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="设置">
            <IconBtn icon="mdi-cog-refresh" @click="resetSettings" tooltip="重置所有设置" />
        </ActionToolBarBase>
    </Teleport>

    <v-col id="container">
        <div v-for="cat in cats" :key="cat">
            <v-card class="rounded-lg">
                <v-list lines="two">
                    <v-list-subheader v-if="cat">{{ cat }}</v-list-subheader>
                    <v-list-subheader v-else>未分组</v-list-subheader>
                    <v-list-item v-for="item in extractByCat(cat)" :key="item.name" :title="item.title"
                        :subtitle="item.des || '暂无描述'">
                        <template v-slot:append>
                            <!-- 开关 -->
                            <div v-if="item.type === 'switcher'" @click="updateSettings">
                                <v-switch v-model="item.value" color="primary" density="compact" />
                            </div>
                            <!-- 按钮 -->
                            <div v-else-if="item.type === 'button'" :onclick="item.value">
                                <v-btn type="primary" size="small" color="primary">触发</v-btn>
                            </div>
                            <!-- 图片 -->
                            <div v-else-if="item.type === 'img'" style="width:155px;">
                                <v-file-input show-size accept="image/png, image/jpeg, image/bmp" label="选择图片"
                                    @update:modelValue="(files) => {
                                            handleFile(files[0], item.name)
                                        }" density="compact"></v-file-input>
                            </div>
                            <!-- 滑动条 -->
                            <div v-else-if="item.type === 'slider'" @click="updateSettings" style="width:155px;">
                                <!-- TS类型限制，只能把v-model展开 -->
                                <v-slider thumb-label="always" color="primary" :modelValue="item.value.toString()"
                                    @update:modelValue="newValue => { item.value = newValue.toString() }"></v-slider>
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
import settingItem from "../../types/settingItem";
import emitter from "../../eventBus";
import ActionToolBarBase from "@/components/shared/ActionToolBarBase.vue";
import { nextTick, computed } from "vue";
import { useMainStore } from "@/store"
const mainStore = useMainStore()

const log = (arg) => {
    console.log(arg)
}

const updateSettings = () => {
    nextTick(function () {
        emitter.emit('updateSettings')
    })
}

const resetSettings = () => {
    emitter.emit("resetSettings")
}

const extractByCat = (cat) => {
    return mainStore.settings.filter((item) => { return item.cat === cat })
}

const handleFile = (file, targetSettingName) => {
    const settings: Array<settingItem> = mainStore.settings
    if (file) {
        const reader = new FileReader()
        reader.onload = function () {
            const resBase64 = this.result.toString(); // 获取数据
            if (resBase64) {
                let index = -1
                // 获取索引
                for (let i = 0; i < settings.length; i++) {
                    if (settings[i].name === targetSettingName) {
                        index = i
                        break
                    }
                }
                // 修改对应设置&apply
                settings[index].value = resBase64
                mainStore.setSettings()
                updateSettings()
            } else {
                console.error("读取base64失败");
                emitter.emit('showMsg', { level: "error", msg: "读取base64失败" });
            }
        };

        reader.readAsDataURL(file)
    }
}

const cats = computed(() => {
    const settings = mainStore.settings
    const res = settings.map(item => {
        return item.cat
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
