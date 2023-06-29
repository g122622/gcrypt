import emitter from "@/eventBus";

function info(msg: string) {
    emitter.emit("showMsg", {
        level: "info",
        msg
    })
}

function warning(msg: string) {
    emitter.emit("showMsg", {
        level: "warning",
        msg
    })
}

function error(msg: string) {
    emitter.emit("showMsg", {
        level: "error",
        msg
    })
}

const notification = { info, warning, error }

export default notification
