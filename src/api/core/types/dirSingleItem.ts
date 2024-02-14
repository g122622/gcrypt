/**
 * File: \src\api\core\types\DirSingleItem.ts
 * Project: Gcrypt
 * Created Date: 2023-11-26 17:14:30
 * Author: Guoyi
 * -----
 * Last Modified: 2024-02-14 11:45:57
 * Modified By: Guoyi
 * -----
 * Copyright (c) 2024 Guoyi Inc.
 *
 * ------------------------------------
 */

import singleFileMetaData from "./singleFileMetaData";

interface DirSingleItem {
    name: string,
    type: 'file' | 'folder',
    isSymlink: boolean,
    meta: singleFileMetaData,
    key: string | null,
    extraMetaKeysList: string[]
}

// // 单独的 interface，其中 a、b 和 c 是必须的
// interface ABC {
//     a: any;
//     b: any;
//     c: any;
// }

// // 不包括 a、b、c 的剩余属性，都是可选的
// interface OptionalDE {
//     d?: any;
//     e?: any;
// }

// // 将原本的 MyInterface 拆分成两种情形：
// // 1. 不包含 a（也意味着不包含 b 和 c）
// // 2. 包含 a 以及必须的 b 和 c
// interface MyInterface extends OptionalDE {
//     a?: never; // 如果 a 被设置，则类型将不兼容
//     b?: never; // b 和 c 也同样设置为 never，因为如果 a 不在，b 和 c 也不应当存在
//     c?: never;
// }

// // 创建一个联合类型，要么 MyInterface 没有 a、b、c，要么 ABC 必须有 a、b、c，且都组合了 OptionalDE 的 d 和 e
// type NewMyInterface = MyInterface | (ABC & OptionalDE);

// let valid1: NewMyInterface = { d: 123 }; // 正确：没有 a、b、c
// let valid2: NewMyInterface = { a: 'foo', b: 'bar', c: 'baz', e: 456 }; // 正确：有 a、b、c 和可选的 e
// let invalid1: NewMyInterface = { a: 'foo' }; // 错误：有 a，但是没有 b 和 c
// let invalid2: NewMyInterface = { b: 'bar' }; // 错误：不能只有 b 和 c

// type ConstraintAssociativeRequirement<T, U extends Array<string>> = {

// }

export default DirSingleItem
