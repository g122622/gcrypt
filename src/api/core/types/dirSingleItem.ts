import singleFileMetaData from "./singleFileMetaData";

interface dirSingleItem {
    name: string,
    type: string,
    meta: singleFileMetaData,
    key: string | null,
}

export default dirSingleItem