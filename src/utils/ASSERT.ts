import { error } from "./gyConsole";
import { abort } from "process"

export default function ASSERT(condition: any) {
    if (!condition) {
        error("ASSERT FAILED")
        abort()
    }
}
