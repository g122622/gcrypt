<template>
    <div id="container">
        <canvas id="perf-canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue"
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { memoryUsage } from "memoryUsage";
import utils from "@/utils/utils";
const props = defineProps(["maxDataAmountLimit", "memDatas", "updateIntervalMs"])

// 如果想减少打包大小，则这样按需引入
// import {
//     Chart, ChartConfiguration, LineController, LineElement,
//     PointElement, LinearScale, Title, CategoryScale
// } from 'chart.js'
// Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

let memDatas: Array<memoryUsage> = []
let chartInstance = null
let updateIntervalHandle = null

const formatSize = (arg) => {
    return utils.prettyBytes(arg, 0)
        .replaceAll("MB", "")
        .replaceAll("Bytes", "")
        .replaceAll("GB", "")
        .replaceAll("KB", "")
}

const updateRender = (arg: Array<memoryUsage>) => {
    memDatas = arg
    chartInstance.data.datasets[0].data = memDatas.map(item => formatSize(item.rss))
    chartInstance.data.datasets[1].data = memDatas.map(item => formatSize(item.external))
    chartInstance.data.datasets[2].data = memDatas.map(item => formatSize(item.heapUsed))
    chartInstance.data.datasets[3].data = memDatas.map(item => formatSize(item.heapTotal))
    chartInstance.update("none")
}

let labels = []
for (let i = 0; i < props.maxDataAmountLimit - 1; i++) {
    labels[i] = ""
}
const chartConfig = {
    type: 'line',
    data: {
        labels,
        datasets: [{
            label: 'rss',
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            data: []
        },
        {
            label: 'external',
            fill: false,
            borderColor: 'rgb(235, 162, 54)',
            data: []
        },
        {
            label: 'heapUsed',
            fill: false,
            borderColor: 'rgb(235, 37, 101)',
            data: []
        },
        {
            label: 'heapTotal',
            fill: false,
            borderColor: 'rgb(100, 201, 54)',
            data: []
        }]
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: '内存统计数据'
            },
        },
        interaction: {
            intersect: false,
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: `时间-刷新间隔：${props.updateIntervalMs}ms，显示时长：${props.updateIntervalMs * props.maxDataAmountLimit / 1000}s`
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'MB'
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }
};

onMounted(() => {
    const element = document.getElementById('perf-canvas') as HTMLCanvasElement;
    const ctx = element.getContext('2d');
    chartInstance = new Chart(ctx, chartConfig as ChartConfiguration);
    updateIntervalHandle = setInterval(() => {
        updateRender(props.memDatas)
    }, props.updateIntervalMs)
})

// gracefully exit
// 销毁句柄和chart实例
onUnmounted(() => {
    clearInterval(updateIntervalHandle)
    chartInstance.destroy()
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
