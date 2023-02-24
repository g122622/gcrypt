<template>
    <v-col class="container">
        <div v-for="cat in cats" :key="cat">
            <v-card class="rounded-lg">
                <v-list lines="one">
                    <v-list-subheader v-if="cat">{{ cat }}</v-list-subheader>
                    <v-list-subheader v-else>未分组</v-list-subheader>
                    <v-list-item v-for="item in this.extractByCat(cat)" :key="item.name" :title="item.des">
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
                            <div v-else-if="item.type === 'img'" @click="updateSettings" style="width:155px;">
                                <v-file-input show-size accept="image/png, image/jpeg, image/bmp" label="选择图片"
                                    @update:modelValue="(file) => {
                                        handleFile(file[0], 'background_img')
                                    }" density="compact"></v-file-input>
                            </div>
                            <!-- 滑动条 -->
                            <div v-else-if="item.type === 'slider'" @click="updateSettings" style="width:155px;">
                                <v-slider v-model="item.value" thumb-label="always" color="primary"></v-slider>
                            </div>
                        </template>

                    </v-list-item>
                </v-list>
            </v-card>
        </div>

    </v-col>
</template>

<script lang="ts">
import settingItem from "../../types/settingItem";
import emitter from "../../eventBus";

export default {
    name: 'AppSettings',
    components: {
    },
    data() {
        return {

        }
    },
    props: {

    },
    methods: {
        updateSettings() {
            this.$nextTick(function () {
                emitter.emit('updateSettings')
            })
        },
        extractByCat(cat) {
            const settings = this.$store.getters.settings
            return settings.filter((item) => { return item.cat === cat })
        },
        handleFile(file, targetSettingName) {
            const settings: Array<settingItem> = this.$store.getters.settings
            const updateSettings = this.updateSettings
            const commit = this.$store.commit

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
                        commit("settings", settings)
                        updateSettings()
                    } else {
                        console.error("读取base64失败");
                        emitter.emit('showMsg', { level: "error", msg: "读取base64失败" });
                    }
                };

                reader.readAsDataURL(file)
            }
        }
    },
    computed: {
        cats() {
            const settings = this.$store.getters.settings
            const res = settings.map(item => {
                return item.cat
            }).filter(function (item, index, arr) {
                return arr.indexOf(item) === index; // 数组去重
            })
            return res
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.container {
    display: flex;
    flex-wrap: wrap;

    >div {
        min-width: 400px;
        margin: 5px;
        flex-grow: 1;
    }
}
</style>
