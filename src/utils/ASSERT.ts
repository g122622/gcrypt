import { error } from "./gyConsole";

export default function ASSERT(arg: any) {
    if (!arg) {
        error("断言失败！")
        throw new Error()
    }
}
