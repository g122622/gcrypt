import emitter from "@/eventBus"
import WebBrowser from "@/components/WebBrowser/WebBrowser.vue";
import ImageViewer from "@/components/ImageViewer/ImageViewer.vue"

/**
 * 注册内置方法
 * 这里借鉴了Webpack一切皆plugin的设计理念
 * OpenMethodMgr本身只是一个壳子，需要注册方法来起作用
 */
export default async function registerBulitinOpenMethods(mgr) {
    mgr.registerMethod({
        name: "内置浏览器打开",
        icon: 'mdi-earth',
        fileType: ['html', 'txt', 'js'],
        async onSelected(file) {
            emitter.emit("Action::addTab",
                {
                    name: `浏览器-${await file.read()}`,
                    component: WebBrowser,
                    icon: 'mdi-earth',
                    onClick: () => null,
                    props: { src: await file.read() }
                })
        }
    })
    mgr.registerMethod({
        name: "内置图片查看器",
        icon: 'mdi-image',
        fileType: ['jpg', 'jpeg', 'png', 'gif'],
        async onSelected(file) {
            emitter.emit("Action::addTab",
                {
                    name: '图片查看器',
                    component: ImageViewer,
                    icon: "mdi-image",
                    onClick: () => null,
                    props: { images: [{ src: await file.read() }] }
                }
            )
        }
    })
    mgr.registerMethod({
        name: "生成md5值",
        icon: 'mdi-folder-pound',
        fileType: /./,
        async onSelected(file) {
            // TODO const md5 = await getMD5(await file.read())
            // TODO showMsg
        }
    })
    mgr.registerMethod({
        name: "外部打开(写入本地文件系统缓存,并监听写入以同步)",
        icon: 'mdi-open-in-new',
        fileType: /./,
        async onSelected(file) {
            const tmpdir = await file.toTempFile()
            Electron.shell.openExternal(tmpdir)
        }
    })
}
