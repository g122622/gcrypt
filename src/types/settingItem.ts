import settingTypes from "./settingTypes"

interface settingItem {
    name: string,
    type: settingTypes,
    value: string | boolean,
    des: string,
    category: string,
    title: string,
    extra?: {
        maxLimitation?: number,
        minLimitation?: number,
        step?: number
    }
}

export default settingItem
