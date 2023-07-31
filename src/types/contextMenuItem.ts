interface contextMenuItem {
    type?: "divider" | "icon+content" | "icon" | "sub",
    actions?: {
        onHover?: (event?) => void,
        onClick?: (event?) => void,
        onClose?: (event?) => void,
    },
    icon?: string, // 字体图标名或base64(img的src可以直接识别的那种)
    text?: string,
    tooltip?: string,
    sub?: Array<contextMenuItem>
}

export default contextMenuItem
