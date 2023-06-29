interface EntryJson {
    modifiedTime:number,
    createdTime: number,
    accessedTime: number,
    storageName:string,
    comment: string,
    storeType: string,
    config: {
        KVPEngine: string,
        adapter: string,
        encryptionEngine: string
    }
}

export default EntryJson
