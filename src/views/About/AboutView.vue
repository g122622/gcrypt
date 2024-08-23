<template>
    <!-- 顶部工具栏 -->
    <Teleport to="#ActionToolBar">
        <ActionToolBarBase ToolbarTitle="关于">
            <IconBtn icon="mdi-gift" tooltip="捐赠作者" />
        </ActionToolBarBase>
    </Teleport>
    <v-col>
        <v-alert border="start" color="blue-gray" variant="elevated" class="about-msg"
            style="font-size: 15px; margin-top: 20px;">
            <template #prepend>
                <img src="./favicon.png" style="width: 150px;">
            </template>
            <div>
                Gcrypt（中文名：隐域）是一个基于crypto和openSSL开发的一个数据加密软件，它利用AES加密算法保护你存储在.gcrypt文件中的数据。
            </div>
            <div>
                AES算法目前被各国政府和军方广泛应用在涉密数据的存储中。
            </div>
            <div>
                这是我高中时期做的项目。总的来说，隐域是一个基于OpenSSL的数据加密软件，用来加密和存放那些你觉得应该加密的文件。
            </div>
            <div>
                在隐域，你的数据通过"加密库"来统一管理。比如，如果你想加密电脑上的若干文件和文件夹，你只需要创建一个带密码的加密库，再将文件直接拖入。
            </div>
            <div>
                与VMWare虚拟机的虚拟磁盘文件类似，一个加密库对应物理硬盘上一个.gcrypt文件，但在这个文件中可以包含上万数量的加密文件。这极大方便了网盘传输和数据的搬迁。为此，我专门实现了一个基于链式文件分配树技术的内建文件系统，用于操作加密库。核心代码位于/src/api/core下。为了应对可能出现的复杂文件树结构，我还为文件系统实现了一个粗陋的LRU缓存。
            </div>
            <div>
                该项目使用electron+vue3全家桶开发。
            </div>
        </v-alert>
    </v-col>
    <div id="about-lists-container">
        <v-col>
            <v-card class="rounded-lg">
                <v-list lines="one">
                    <v-list-subheader>运行环境/版本</v-list-subheader>
                    <v-list-item v-ripple v-for="item in runtimeTableData" :key="item.key" :subtitle="item.key"
                        :title="item.value">
                        <template #prepend>
                            <img :src="`./assets/about/${item.img}`" class="image" />
                        </template>
                        <template #append>
                            <IconBtn icon="mdi-open-in-new" tooltip="item.link" :onClick="() => { }" />
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-col>
        <v-col>
            <v-card class="rounded-lg">
                <v-list lines="one">
                    <v-list-subheader>依赖库</v-list-subheader>
                    <v-list-item v-ripple v-for="item in depLibsTableData" :key="item.key" :subtitle="item.key"
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
                    <v-list-subheader>构建信息</v-list-subheader>
                    构建日期：
                    {{ store.COMPILE_DATE }}
                    <br>
                    构建号：
                    {{ store.COMPILE_NUMBER }}
                    <br>
                    构建平台：
                    {{ store.COMPILE_PLATFORM }}
                    <br>
                    构建CPU信息：
                    {{ store.COMPILE_CPU }}
                    <br>
                    构建内存信息：
                    {{ store.COMPILE_MEM }}
                    <br>
                    构建环境：
                    {{ store.COMPILE_ENV }}
                </div>

            </v-card>
        </v-col>
    </div>
    <BottomTip></BottomTip>
</template>

<script setup lang="ts">
import { version } from "vue";
import { useMainStore } from "@/store/main"
const store = useMainStore()

interface Versions {
    node: string,
    electron: string,
    v8: string,
    chrome: string
}
const versions: Versions = (process as any).versions

const runtimeTableData = [
    { key: `应用框架`, value: `Electron ${versions.electron}`, img: "electron.png" },
    { key: `响应式UI框架`, value: `Vue ${version}`, img: "Vue.png" },
    { key: `UI组件库`, value: `Vuetify`, img: "vuetify.svg" },
    { key: `开发语言`, value: `TypeScript`, img: "typescript.png" },
    { key: `项目脚手架`, value: `Vue-cli`, img: "Vue.png" },
    { key: `构建工具`, value: `Webpack 5 electron-bulider`, img: "Webpack.png" },
    { key: `JavaScript环境`, value: `NodeJs ${versions.node}`, img: "nodejs.png" },
    { key: `JavaScript引擎`, value: `V8 ${versions.v8}`, img: "v8.png" },
    { key: `Web支持`, value: `Chromium ${versions.chrome}`, img: "chrome.svg" },
]

const depLibsTableData = [
    { key: `工具库`, value: `Lodash`, img: "lodash.png" },
    { key: `状态管理`, value: `Pinia`, img: "pinia.svg" },
    { key: `路由管理`, value: `Vue Router`, img: "Vue.png" },
    { key: `中央事件总线`, value: `Mitt`, img: "mitt.png" },
    { key: `网络请求库`, value: `Axios`, img: "axios.png" },
    { key: `canvas图表绘制`, value: `Chart.js`, img: "chartjs.ico" },
    { key: `轻量级electron数据存储`, value: `electron-store`, img: "nodejs.png" },
    { key: `齐全美观的图标库`, value: `iconfont`, img: "iconfont.png" },
    { key: `时间、日期操作库`, value: `dayjs`, img: "nodejs.png" },
]
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#about-lists-container {
    padding: 10px;
    display: flex;
    flex-wrap: wrap;

    // 调节子元素的性质。这里是列表们
    >div {
        min-width: 400px;
        flex-grow: 1;
        padding: 5px;
    }
}

.bottom {
    font-size: 15px;
    white-space: pre-wrap;
    padding: 10px 25px 10px 25px;
}

.image {
    width: 30px;
    display: block;
    margin-right: 10px;
}

.about-msg {
    div {
        text-indent: 25px;
    }
}
</style>
