const fileTypes = {
    excel: ["xls", "xlsx"],
    folder: [],
    word: ["doc", "docx"],
    ppt: ["ppt", "pptx"],
    audio: ["mp3", "ogg", "wav", "m4a"],
    code: ["js", "ts", "vue", "jsx", "css", "cpp", "h", "c", "xml"],
    video: ["mp4", "mkv", "webm", "avi", "flv", "mov"],
    link: ["html", "lnk"],
    img: ["heic", "jpg", "jpeg", "png", "webp", "ico", "bmp"],
    zip: ["7z", "zip", "rar", "gz", "iso", "dmg"],
    unknown: [],
    gif: ["gif"],
    exe: ["exe"],
    pdf: ["pdf"],
    txt: ["txt"],
    db: ["db"],
    config: ["ini", "json", "cfg"]
}

export default fileTypes
