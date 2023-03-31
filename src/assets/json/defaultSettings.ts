const text = "孩提时，我有许多美丽的憧憬，天真的梦。那时，我最喜欢看天上的星河。夏夜仰望那缀满星星的夜空，我会几个小时地坐着发痴，小脑瓜里整个儿盘旋着关于星星月亮的种种神话传说。于是，我总相信月宫里有嫦娥，早晚有一天会从那影影绰绰的桂花树下飘飘走出，而那璀璨的星星呢，一定是那些调皮的小仙女随意抛洒的宝石珠贝。我很想什么时候飞上天去，抓住天幕的一角轻轻一抖，让这些明亮得耀眼的珠宝纷纷飞落下来，穿过云端，落到人间。"

const defaultSettings = [
    {
        name: "is_dark",
        type: "switcher",
        value: true,
        title: "夜间模式",
        des: "使用黑色元素配色"
        cat: "外观",
    },
    {
        name: "use_shade",
        type: "switcher",
        value: false,
        title: "背景黑色遮罩",
        des: "绘制一个纯黑色窗口，覆盖屏幕工作区域",
        cat: "通用"
    },
    {
        name: "dev1",
        type: "button",
        value: "require('electron').ipcRenderer.send('new-message',{ code: 'toggleDT'})",
        title: "切换开发者工具",
        des: "打开或关闭开发者工具窗口，用于开发和调试",
        cat: "开发者"
    },
    {
        name: "on_top",
        type: "switcher",
        value: true,
        title: "窗口悬浮顶层",
        des: "没什么好说的",
        cat: "通用",
    },
    {
        name: "on_top",
        type: "button",
        value: "emitter.emit('showLayout')",
        title: "高亮显示布局",
        des: "用于调试布局，尚处在实验阶段",
        cat: "外观"
    },
    {
        name: "background_img",
        type: "img",
        value: "",
        title: "背景图片",
        des: "从指定本地路径选择背景图片",
        cat: "外观"
    },
    {
        name: "background_img_blur",
        type: "slider",
        value: "70",
        title: "背景图片模糊度",
        des: "给背景图加上指定半径的高斯模糊filter，并不会修改原文件",
        cat: "外观"
    },
    {
        name: "background_img_transp",
        type: "slider",
        value: "80",
        title: "背景图片透明度",
        des: "调低调高都不好",
        cat: "外观"
    },
    {
        name: "dev2",
        type: "button",
        value: "require('electron').ipcRenderer.send('new-message',{ code: 'reload'})",
        title: "强制重启渲染进程",
        des: "在主进程中重载browser window",
        cat: "开发者"
    },
    {
        name: "dev3",
        type: "button",
        value: "require('electron').ipcRenderer.send('new-message',{ code: 'relaunch'})",
        title: "强制重载app主进程",
        des: "直接重启整个electron app，开发环境下使用会导致退出cli",
        cat: "开发者"
    },
    {
        name: "test1",
        type: "button",
        value: `parent.emitter.emit('showMsg', { level: 'error', msg: '${text}' })`,
        title: "显示error通知",
        cat: "测试"
    },
    {
        name: "test2",
        type: "button",
        value: `parent.emitter.emit('showMsg', { level: 'warning', msg: '${text}' })`,
        title: "显示warning通知",
        cat: "测试"
    },
    {
        name: "test3",
        type: "button",
        value: `parent.emitter.emit('showMsg', { level: 'info', msg: '${text}' })`,
        title: "显示info通知",
        cat: "测试"
    },
    {
        name: "test4",
        type: "button",
        value: `parent.emitter.emit('showMsg', { level: 'success', msg: '${text}' })`,
        title: "显示success通知",
        cat: "测试"
    },
    {
        name: "use_bottom_tip",
        type: "switcher",
        value: true,
        title: "显示底部句子",
        des: "是否从网络获取并显示列表底部的装饰性句子",
        cat: "外观"
    },
]

export default defaultSettings