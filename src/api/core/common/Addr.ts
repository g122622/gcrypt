import { error, warn } from "../../../utils/gyConsole";

/* tips
1.tokens数组全空表示根目录:
√ => []
× => [""] or null or [null]
2.绝对不允许tokens数组存在空字符串
3.支持链式调用
*/

class Addr {
    tokens: Array<string>

    toPathStr(): string {
        if (this.tokens.length && this.tokens[0].length && this.tokens[0][this.tokens[0].length - 1] === ":") {
            return this.tokens.join("/")
        } else {
            return "/" + this.tokens.join("/")
        }
    }

    compareWith = function (arg): boolean {
        if (arg.tokens.length !== this.tokens.length) {
            return false
        }
        for (let i = 0; i < arg.tokens.length; i++) {
            if (arg.tokens[i] !== this.tokens[i]) {
                return false
            }
        }
        return true
    }

    up = function (): Addr {
        if (this.isRoot()) {
            return null
        }
        this.tokens.pop()
        return this
    }

    down = function (arg: string): Addr {
        if (arg.indexOf("/") > -1) {
            error("folder token 名不能包含斜杠")
        }
        this.tokens.push(arg)
        return this
    }

    isRoot = function (): boolean {
        // 故意多加的if，方便后续加逻辑
        if (this.tokens.length === 0) {
            return true
        } else {
            if (this.tokens.length === 1 && this.tokens[0].length && this.tokens[0][this.tokens[0].length - 1] === ":") {
                return true
            }
            return false
        }
    }

    getTopToken = function (): string | null {
        if (this.tokens.length === 0) {
            return null
        }
        return this.tokens[this.tokens.length - 1]
    }

    toBreadcrumbs = function () {
        return this.tokens.map(token => {
            return {
                title: token,
                disabled: false,
            }
        })
    }

    constructor(arg = '') {
        // 将输入的所有无效数据(eg:"",null,undefined)统一转为空字符串
        if (!arg) {
            arg = ''
        }
        this.tokens = slice(arg)
    }
}

const slice = (arg: string) => {
    return arg.replaceAll("\\", "/")
        .split("/")
        .filter(item => item !== "")
}

export default Addr
