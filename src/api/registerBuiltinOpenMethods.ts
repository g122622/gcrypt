import emitter from "@/eventBus"
import WebBrowser from "@/components/WebBrowser/WebBrowser.vue";
import ImageViewer from "@/components/ImageViewer/ImageViewer.vue"
import File from "@/api/File";
import Electron from 'electron'
import FroalaEditor from "@/components/FroalaEditor/FroalaEditor.vue";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";

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
        async onSelected(file: File) {
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
        async onSelected(file: File) {
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
        async onSelected(file: File) {
            // TODO const md5 = await getMD5(await file.read())
        }
    })
    mgr.registerMethod({
        name: "外部打开(写入本地文件系统缓存,并监听写入以同步)",
        icon: 'mdi-open-in-new',
        fileType: /./,
        async onSelected(file: File) {
            const tmpdir = await file.toTempFile()
            Electron.shell.openExternal(tmpdir)
        }
    })
    mgr.registerMethod({
        name: "FroalaEditor",
        icon: 'mdi-file-edit',
        fileType: ['txt', 'html'],
        async onSelected(file: File) {
            emitter.emit("Action::addTab",
                {
                    name: 'FroalaEditor-' + file.filename,
                    component: FroalaEditor,
                    icon: "mdi-file-edit",
                    onClick: () => null,
                    props: { file }
                }
            )
        }
    })
    mgr.registerMethod({
        name: "MonacoEditor",
        icon: 'mdi-microsoft-visual-studio-code',
        fileType: ['txt', 'html', 'js', 'json', 'vue', 'ts'],
        async onSelected(file: File) {
            emitter.emit("Action::addTab",
                {
                    name: 'MonacoEditor-' + file.filename,
                    component: MonacoEditor,
                    icon: "mdi-microsoft-visual-studio-code",
                    onClick: () => null,
                    props: { file }
                }
            )
        }
    })
}
