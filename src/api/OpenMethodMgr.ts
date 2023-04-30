import emitter from "../eventBus"
import TagsMgr from "./TagsMgr"
import WebBrowser from "@/components/WebBrowser/WebBrowser.vue";
import ImageViewer from "@/components/ImageViewer/ImageViewer.vue"

interface OpenMethod {
    name: string, // 必须唯一，不能重复
    icon: string,
    fileType: Array<string>,
    dataTransfer: 'RAM' | 'LOCAL_DISK',
    onSelected: (data: Buffer | string) => void
}

const formatFileType = (arg: string) => {
    return arg.replaceAll('.', '')
        .toLowerCase()
}

class OpenMethodMgr {
    private methods: Array<OpenMethod> = []

    private registerBulitinMethods() {
        this.registerMethod({
            name: "内置浏览器打开",
            icon: 'mdi-earth',
            fileType: ['html', 'txt', 'js'],
            dataTransfer: 'RAM',
            onSelected(data: string) {
                TagsMgr.addTab(
                    {
                        name: `浏览器-${data}`,
                        component: WebBrowser,
                        icon: 'mdi-earth',
                        onClick: () => null,
                        props: { src: data }
                    }
                )
            }
        })
        this.registerMethod({
            name: "内置图片查看器",
            icon: 'mdi-image',
            fileType: ['jpg', 'jpeg', 'png', 'gif'],
            dataTransfer: 'RAM',
            onSelected(data: string) {
                TagsMgr.addTab(
                    {
                        name: '图片查看器',
                        component: ImageViewer,
                        icon: "mdi-image",
                        onClick: () => null,
                        props: { images: [{ src: data }] }
                    }
                )
            }
        })
    }

    public getMatchedMethod(fileType: string) {
        return this.methods.filter(item => item.fileType.includes(formatFileType(fileType)))
    }

    public registerMethod = (openMethod: OpenMethod) => {
        this.methods.push(openMethod)
    }

    public removeMethod = (name) => {
        this.methods = this.methods.filter(item => item.name !== name)
    }

    constructor() {
        this.registerBulitinMethods()
    }
}

export default new OpenMethodMgr()
