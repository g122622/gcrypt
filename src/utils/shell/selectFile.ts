export default function selectFile(useDirectory: boolean) {
    return new Promise((resolve) => {
        const inputElement = document.createElement("input")
        inputElement.type = 'file'
        inputElement.style.display = 'none'
        if (useDirectory) {
            inputElement.toggleAttribute('webkitdirectory', true)
        }
        document.body.appendChild(inputElement)
        inputElement.onchange = () => {
            resolve(inputElement.files)
            document.body.removeChild(inputElement)
        }
        inputElement.click()
    })
}
