import emitter from "@/eventBus"
import WebBrowser from "@/components/WebBrowser/WebBrowser.vue";
import ImageViewer from "@/components/ImageViewer/ImageViewer.vue"
import File from "@/api/File";
import Electron from 'electron'
import FroalaEditor from "@/components/FroalaEditor/FroalaEditor.vue";
import getDigest from "@/api/hash/getDigest"
import pickFile from "@/utils/shell/pickFile";
import AceEditor from "@/components/AceEditor/AceEditor.vue";
import JsonEditor from "@/components/JsonEditor.vue";

/**
 * 注册内置方法
 * 这里借鉴了Webpack一切皆plugin的设计理念
 * OpenMethodMgr本身只是一个壳子，需要注册方法来起作用
 */
export default async function registerBulitinOpenMethods(mgr) {
    mgr.registerMethod({
        name: "内置浏览器",
        icon: 'mdi-earth',
        fileType: ['html', 'txt', 'js'],
        async onSelected(file: File) {
            emitter.emit("Action::addTab",
                {
                    name: `${await file.filename} -浏览器`,
                    component: WebBrowser,
                    icon: 'mdi-earth',
                    onClick: () => null,
                    props: { content: (await file.read()).toString() }
                })
        }
    })
    // mgr.registerMethod({
    //     name: "内置图片viewer",
    //     icon: 'mdi-image',
    //     fileType: ['jpg', 'jpeg', 'png', 'gif'],
    //     async onSelected(file: File) {
    //         emitter.emit("Action::addTab",
    //             {
    //                 name: '图片查看器',
    //                 component: ImageViewer,
    //                 icon: "mdi-image",
    //                 onClick: () => null,
    //                 props: { images: [{ src: await file.read() }] }
    //             }
    //         )
    //     }
    // })
    mgr.registerMethod({
        name: "外部打开",
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
                    name: file.filename + '-FroalaEditor',
                    component: FroalaEditor,
                    icon: "mdi-file-edit",
                    onClick: () => null,
                    props: { file }
                }
            )
        }
    })
    mgr.registerMethod({
        name: "AceEditor",
        icon: 'mdi-microsoft-visual-studio-code',
        fileType: ['txt', 'html', 'js', 'json', 'vue', 'ts'],
        async onSelected(file: File) {
            emitter.emit("Action::addTab",
                {
                    name: file.filename + "-AceEditor",
                    component: AceEditor,
                    icon: "mdi-microsoft-visual-studio-code",
                    onClick: () => null,
                    props: { file }
                }
            )
        }
    })
    mgr.registerMethod({
        name: "JsonEditor",
        icon: 'mdi-code-json',
        fileType: ['txt', 'json'],
        async onSelected(file: File) {
            emitter.emit("Action::addTab",
                {
                    name: file.filename + "-JsonEditor",
                    component: JsonEditor,
                    icon: "mdi-code-json",
                    onClick: () => null,
                    props: { file }
                }
            )
        }
    })
    mgr.registerMethod({
        name: "导出文件",
        icon: 'mdi-export-variant',
        fileType: /./,
        async onSelected(file: File) {
            const directory = (await pickFile(null, true, false, true))[0]
            await file.exportToExt(directory)
        }
    })
    mgr.registerMethod({
        name: "生成md5值",
        icon: 'mdi-folder-pound',
        fileType: /./,
        async onSelected(file: File) {
            const dialogStore = (await import("@/store/dialog")).useDialogStore()
            const md5 = await getDigest(await file.read(), 'md5')
            dialogStore.addDialog({
                isPersistent: false,
                isDialogOpen: true,
                title: 'md5生成结果',
                destroyAfterClose: true,
                width: '450px',
                // height: '250px',
                HTMLContent: `文件名: ${file.filename}
                <br/>
                md5: ${md5}
            `
            })
        }
    })
    mgr.registerMethod({
        name: "生成sha1值",
        icon: 'mdi-folder-pound',
        fileType: /./,
        async onSelected(file: File) {
            const dialogStore = (await import("@/store/dialog")).useDialogStore()
            const sha1 = await getDigest(await file.read(), 'sha1')
            dialogStore.addDialog({
                isPersistent: false,
                isDialogOpen: true,
                title: 'sha1生成结果',
                destroyAfterClose: true,
                width: '550px',
                // height: '250px',
                HTMLContent: `文件名: ${file.filename}
                <br/>
                sha1: ${sha1}
            `
            })
        }
    })
}
