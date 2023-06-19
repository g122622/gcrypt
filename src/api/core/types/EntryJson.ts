interface EntryJson {
    modifiedTime:number,
    createdTime: number,
    accessedTime: number,
    storageName:string,
    comment:string,
    extra: {
        entryKey?,
    }
}

export default EntryJson
