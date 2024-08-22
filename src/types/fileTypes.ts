const fileTypes = {
    excel: ["xls", "xlsx"],
    word: ["doc", "docx"],
    ppt: ["ppt", "pptx"],
    audio: ["mp3", "ogg", "wav", "m4a"],
    code: ["js", "ts", "vue", "jsx", "css", "cpp", "h", "c", "xml"],
    video: ["mp4", "mkv", "webm", "avi", "flv", "mov"],
    link: ["html", "lnk"],
    img: ["heic", "jpg", "jpeg", "png", "webp", "ico", "bmp"],
    zip: ["7z", "zip", "rar", "gz", "iso", "dmg"],
    gif: ["gif"],
    exe: ["exe"],
    pdf: ["pdf"],
    txt: ["txt"],
    db: ["db"],
    config: ["ini", "json", "cfg"]
};

const toHashMapAndLowerCase = (obj: typeof fileTypes) => {
    const ret = {};
    Object.keys(obj).forEach(key => obj[key].forEach(v => (ret[v] = key.toLocaleLowerCase())));
    return ret;
};

const fileTypesHashMap = toHashMapAndLowerCase(fileTypes);

export { fileTypes, fileTypesHashMap };
