import settingTypes from "./settingTypes"

interface settingItem {
    name: string,
    type: settingTypes,
    value: string | boolean,
    des: string,
    category: string,
    title: string,
    extra?: {
        maxLimitation?: string,
        minLimitation?: string
    }
}

export default settingItem
