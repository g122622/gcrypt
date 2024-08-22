/**
 * File: \src\api\core\common\Addr.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-23 16:19:47
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import { error } from "../../../utils/gyConsole";

const slice = (arg: string) => {
    return arg
        .replaceAll("\\", "/")
        .split("/")
        .filter(item => item !== "");
};

/** tips
 * 1.tokens数组全空表示根目录:
 * √ => []
 * × => [""] or null or [null]
 * 2.绝对不允许tokens数组存在空字符串
 * 3.支持链式调用
 */
class Addr {
    public tokens: Array<string>;

    constructor(arg = "") {
        // 将输入的所有无效数据(eg:"",null,undefined)统一转为空字符串
        if (!arg) {
            arg = "";
        }
        this.tokens = slice(arg);
    }

    public toPathStr(): string {
        if (this.tokens.length && this.tokens[0].length && this.tokens[0][this.tokens[0].length - 1] === ":") {
            return this.tokens.join("/");
        } else {
            return "/" + this.tokens.join("/");
        }
    }

    public compareWith(arg): boolean {
        if (arg.tokens.length !== this.tokens.length) {
            return false;
        }
        for (let i = 0; i < arg.tokens.length; i++) {
            if (arg.tokens[i] !== this.tokens[i]) {
                return false;
            }
        }
        return true;
    }

    public up(): Addr {
        if (!this.isRoot()) {
            this.tokens.pop();
        }
        return this;
    }

    public down(arg: string): Addr {
        if (arg.indexOf("/") > -1) {
            error("folder token 名不能包含斜杠");
        }
        this.tokens.push(arg);
        return this;
    }

    public isRoot(): boolean {
        // 故意多加的if，方便后续加逻辑
        if (this.tokens.length === 0) {
            return true;
        } else {
            if (this.tokens.length === 1 && this.tokens[0].length && this.tokens[0][this.tokens[0].length - 1] === ":") {
                return true;
            }
            return false;
        }
    }

    public goToRoot(): Addr {
        if (this.tokens[0].length && this.tokens[0][this.tokens[0].length - 1] === ":") {
            this.tokens = this.tokens.slice(0, 1);
        } else {
            this.tokens = [];
        }
        return this;
    }

    public getTopToken(): string | null {
        if (this.tokens.length === 0) {
            return null;
        }
        return this.tokens[this.tokens.length - 1];
    }

    public toBreadcrumbs() {
        return this.tokens.map(token => {
            return {
                title: token,
                disabled: false
            };
        });
    }

    public setTokens(arg: Array<string> = []) {
        this.tokens = arg;
        return this;
    }

    public static setTokens(arg: Array<string> = []) {
        const addr = new Addr();
        addr.setTokens(arg);
        return addr;
    }
}

export default Addr;
