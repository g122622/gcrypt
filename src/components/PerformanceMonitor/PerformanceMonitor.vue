<template>
    <div class="text-center">
        <v-menu v-model="isMenuOpen" :close-on-content-click="false" location="end">
            <template v-slot:activator="{ props }">
                <v-btn type="icon" v-bind="props" size="small" style="margin-top:10px">
                    <v-icon>
                        mdi-chart-bell-curve
                    </v-icon>
                </v-btn>
            </template>

            <v-card width="600" height='350'>
                <CanvasChart :maxDataAmountLimit="maxDataAmountLimit" :memDatas="memDatas"
                    :updateIntervalMs="updateIntervalMs" v-if="isMenuOpen" />
                <v-divider></v-divider>

                <v-card-actions>
                    <v-btn>
                        <v-icon>mdi-help-circle</v-icon>
                        <v-tooltip activator="parent" location="bottom">
                            ·heapTotal 和 heapUsed 指的是 V8 的内存使用量。<br>
                            ·external 指的是绑定到 V8 管理的 JavaScript 对象的 C++ 对象的内存使用量。<br>
                            ·rss，常驻集大小，是进程在主内存设备（即总分配内存的子集）中占用的空间量，包括所有 C++ 和 JavaScript 对象和代码。<br>
                            ·arrayBuffers 是指为 ArrayBuffer 和 SharedArrayBuffer 分配的内存，包括所有 Node.js Buffer。 这也包含在 external
                            值中。当Node.js 被用作嵌入式库时，此值可能为 0，因为在这种情况下可能不会跟踪 ArrayBuffer 的分配。
                            当使用 Worker 线程时，则 rss 将是对整个进程都有效的值，而其他字段仅涉及当前线程。<br>
                            process.memoryUsage() 方法遍历每个页面以收集有关内存使用情况的信息，这可能会根据程序内存分配而变慢。
                        </v-tooltip>
                    </v-btn>
                    <v-btn @click="clearMem()">
                        <v-icon>mdi-trash-can</v-icon>
                        <v-tooltip activator="parent" location="bottom">
                            调用webFrame.clearCache()清理内存
                        </v-tooltip>
                    </v-btn>
                    <v-spacer></v-spacer>

                    <v-btn variant="text" @click="isMenuOpen = false">
                        退出监视器
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="isMenuOpen = false; downLoadImage()">
                        保存为图片
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    </div>
</template>

<script setup lang="ts">
import { memoryUsage } from "memoryUsage";
import { ref, onMounted, nextTick } from "vue";
import CanvasChart from "./CanvasChart.vue"
import { webFrame } from "electron";
import emitter from "@/eventBus";

const isMenuOpen = ref(false)
let memDatas: Array<memoryUsage> = []
const maxDataAmountLimit = 60
const updateIntervalMs = 1000

for (let i = 0; i < maxDataAmountLimit; i++) {
    memDatas[i] = {
        arrayBuffers: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0,
        rss: 0,
    }
}

/**
 * 获取nodejs内存使用数据并保存
 */
const fetchMemData = () => {
    memDatas.push(process.memoryUsage())
    if (memDatas.length > maxDataAmountLimit) {
        memDatas.shift()
    }
}

/**
 * 每隔updateIntervalMs就是一个关键帧
 */
const keyFrame = () => {
    fetchMemData()
}

onMounted(async () => {
    await nextTick()
    setInterval(keyFrame, updateIntervalMs)
})

// canvas 为canvas的dom节点
// filename 为生成图片的名字
const downLoadImage = (canvas: HTMLCanvasElement = document.querySelector("#perf-canvas"), filename = null) => {
    if (!filename) {
        filename = `memPerf${Date.now()}.png`
    }
    const a = document.createElement("a");
    a.href = canvas.toDataURL();
    // download 属性定义了下载链接的地址
    a.download = filename;
    a.click();
    a.remove();
}

/**
 * 清理内存
 */
function clearMem() {
    webFrame.clearCache()
    emitter.emit("showMsg", { level: "success", msg: "内存清理成功" })
}

</script>

<style scoped lang="less"></style>
