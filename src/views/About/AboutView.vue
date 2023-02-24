<template>
    <v-col>
        <v-card class="rounded-lg">
            <v-list lines="one">
                <v-list-subheader>依赖/版本</v-list-subheader>
                <v-list-item v-ripple v-for="item in tableData" :key="item.key" :subtitle="item.key"
                    :title="item.value">
                    <template v-slot:prepend>
                        <img :src="`./assets/about/${item.img}`" class="image" />
                    </template>
                </v-list-item>
            </v-list>
        </v-card>
    </v-col>
    <v-col>
        <v-card class="rounded-lg">
            <div class="bottom">
                构建日期：
                {{ this.$store.getters["COMPILE_DATE"] }}
                <br>
                构建号：
                {{ this.$store.getters["COMPILE_NUMBER"] }}
            </div>

        </v-card>
    </v-col>
</template>

<script lang="ts">
interface Versions {
    node: string,
    electron: string,
    v8: string,
    chrome: string
}
const versions = (process as any).versions as Versions

export default {
    name: 'AboutMe',
    props: {

    },
    data() {
        return {
            tableData: [
                { key: `应用框架`, value: `Electron ${versions.electron}`, img: "electron.png" },
                { key: `响应式UI框架`, value: `Vue3`, img: "Vue.png" },
                { key: `UI组件库`, value: `Vuetify`, img: "vuetify.svg" },
                { key: `状态管理`, value: `Vuex`, img: "vuex.png" },
                { key: `路由管理`, value: `Vue Router`, img: "Vue.png" },
                { key: `中央事件总线`, value: `Mitt`, img: "mitt.png" },
                { key: `开发语言`, value: `TypeScript`, img: "typescript.png" },
                { key: `工具库`, value: `Lodash`, img: "lodash.png" },
                { key: `项目脚手架`, value: `Vue-cli`, img: "Vue.png" },
                { key: `构建工具`, value: `Webpack 5 electron-bulider`, img: "Webpack.png" },
                { key: `JavaScript环境`, value: `NodeJs ${versions.node}`, img: "nodejs.png" },
                { key: `JavaScript引擎`, value: `V8 ${versions.v8}`, img: "v8.png" },
                { key: `Web支持`, value: `Chromium ${versions.chrome}`, img: "chrome.svg" },
            ],
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.bottom {
    font-size: 15px;
    margin: 10px;
    padding: 10px;
}

.image {
    width: 30px;
    display: block;
    margin-right: 10px;
}
</style>
