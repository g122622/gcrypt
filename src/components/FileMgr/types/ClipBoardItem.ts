import Addr from "@/api/core/common/Addr";

/**
 * Clip Board应该为一个单词，即Clipboard（中间的B字母不该大写）。
 * 但是为了避免和内置的全局标识符冲突，所以我在这里写作ClipBoard。
 */
export interface ClipBoardItem {
    filename: string,
    srcAddr: Addr,
    method: 'copy' | 'move' | 'symlink'
}
