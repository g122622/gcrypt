/* eslint-disable @typescript-eslint/no-var-requires */
import defaultSettings from "../assets/json/defaultSettings";
const fs = require('fs-extra')

const initSettings = () => {
    fs.writeFileSync('./settings.json', defaultSettings)
}
export default initSettings
