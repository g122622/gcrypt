let text = "孩提时，我有许多美丽的憧憬，天真的梦。那时，我最喜欢看天上的星河。夏夜仰望那缀满星星的夜空，我会几个小时地坐着发痴，小脑瓜里整个儿盘旋着关于星星月亮的种种神话传说。于是，我总相信月宫里有嫦娥，早晚有一天会从那影影绰绰的桂花树下飘飘走出，而那璀璨的星星呢，一定是那些调皮的小仙女随意抛洒的宝石珠贝。我很想什么时候飞上天去，抓住天幕的一角轻轻一抖，让这些明亮得耀眼的珠宝纷纷飞落下来，穿过云端，落到人间。"

const defaultSettings = JSON.stringify([
    {
        name: "is_dark", type: "switcher", value: true, des: "夜间模式", cat: "外观"
    },
    {
        name: "use_shade", type: "switcher", value: false, des: "背景黑色遮罩", cat: "通用"
    },
    {
        name: "dev1", type: "button", value: "require('electron').ipcRenderer.send('new-message',{ code: 'toggleDT'})", des: "切换开发者工具", cat: "开发者"
    },
    {
        name: "on_top", type: "switcher", value: true, des: "窗口悬浮顶层", cat: "通用"
    },
    {
        name: "on_top", type: "button", value: "emitter.emit('showLayout')", des: "高亮显示布局", cat: "外观"
    },
    {
        name: "background_img", type: "img", value: "", des: "背景图片", cat: "外观"
    },
    {
        name: "background_img_blur", type: "slider", value: "70", des: "背景图片模糊度", cat: "外观"
    },
    {
        name: "background_img_transp", type: "slider", value: "80", des: "背景图片透明度", cat: "外观"
    },
    {
        name: "dev2", type: "button", value: "require('electron').ipcRenderer.send('new-message',{ code: 'reload'})", des: "强制重启渲染进程", cat: "开发者"
    },
    {
        name: "dev3", type: "button", value: "require('electron').ipcRenderer.send('new-message',{ code: 'relaunch'})", des: "强制重载app主进程(开发环境慎用)", cat: "开发者"
    },
    {
        name: "test1", type: "button", value: `parent.emitter.emit('showMsg', { level: 'error', msg: '${text}' })`, des: "显示error通知", cat: "测试"
    },
    {
        name: "test2", type: "button", value: `parent.emitter.emit('showMsg', { level: 'warning', msg: '${text}' })`, des: "显示warning通知", cat: "测试"
    },
    {
        name: "test3", type: "button", value: `parent.emitter.emit('showMsg', { level: 'info', msg: '${text}' })`, des: "显示info通知", cat: "测试"
    },
    {
        name: "test4", type: "button", value: `parent.emitter.emit('showMsg', { level: 'success', msg: '${text}' })`, des: "显示success通知", cat: "测试"
    }
])

export default defaultSettings
