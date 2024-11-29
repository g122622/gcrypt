import emitter from "@/eventBus";
import { error as consoleError, warn as consoleWarn } from "@/utils/gyConsole";

function info(msg: string) {
    emitter.emit("showMsg", {
        level: "info",
        msg
    });
}

function warning(msg: string) {
    emitter.emit("showMsg", {
        level: "warning",
        msg
    });
    consoleWarn(msg);
}

function error(msg: string) {
    emitter.emit("showMsg", {
        level: "error",
        msg
    });
    consoleError(msg);
}

function success(msg: string) {
    emitter.emit("showMsg", {
        level: "success",
        msg
    });
}

const notification = { info, warning, error, success };

export default notification;
