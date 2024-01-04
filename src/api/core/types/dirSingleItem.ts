import singleFileMetaData from "./singleFileMetaData";

interface dirSingleItem {
    name: string,
    type: 'file' | 'folder',
    isSymlink: boolean,
    meta: singleFileMetaData,
    key: string | null,
}

export default dirSingleItem
