// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify, ThemeDefinition } from 'vuetify'

const LightTheme: ThemeDefinition = {
    dark: false,
    colors: {
        // background: '#FFFFFF',
        primary: '#607d8b',
        // 'primary-darken-1': '#3700B3',
        // secondary: '#03DAC6',
        // 'secondary-darken-1': '#018786',
        // error: '#B00020',
        // info: '#2196F3',
        // success: '#4CAF50',
        // warning: '#FB8C00',
    }
}

const DarkTheme: ThemeDefinition = {
    dark: true,
    colors: {
        // background: '#FFFFFF',
        primary: '#607d8b',
        // 'primary-darken-1': '#3700B3',
        // secondary: '#03DAC6',
        // 'secondary-darken-1': '#018786',
        // error: '#B00020',
        // info: '#2196F3',
        // success: '#4CAF50',
        // warning: '#FB8C00',
    }
}

export default createVuetify({
    theme: {
        defaultTheme: 'DarkTheme',
        themes: {
            LightTheme,
            DarkTheme
        }
    },
})
