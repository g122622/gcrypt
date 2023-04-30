import router from "@/router"
import toLegalRouterPath from "@/utils/toLegalRouterPath"
import emitter from "../eventBus"

class TagsMgr {
    public addTab = ({ name, component, icon, onClick, props }) => {
        const legalPath = toLegalRouterPath(name)
        router.addRoute({ path: `/${legalPath}`, name, component, props })
        emitter.emit("UI::addTabItem", { name, legalPath, icon, onClick })
        console.log(name)
        router.replace(`/${legalPath}`)
    }

    public removeTab = ({ name }) => {
        router.back()
        router.removeRoute(name)
        emitter.emit('showMsg',
            {
                level: "success",
                msg: "移除标签页成功 "
            })
    }
}

export default new TagsMgr()
