import File from "@/api/File";

export default interface FileActiveState {
    isOpen: boolean,
    isUsingTempFile: boolean,
    file: File
}
