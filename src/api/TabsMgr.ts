import router from "@/router"
import toLegalRouterPath from "@/utils/toLegalRouterPath"
import emitter from "../eventBus"

class TabsMgr {
    public addTab = ({ name, component, icon, onClick, props }) => {
        const legalPath = toLegalRouterPath(name)
        router.addRoute({ path: `/${legalPath}`, name, component, props })
        emitter.emit("UI::addTabItem", { name, legalPath, icon, onClick })
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

    public switchToTab(path) {
        router.push(`/${path}`)
    }
}

export default TabsMgr
