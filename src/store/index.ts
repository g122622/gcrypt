import { createStore } from 'vuex'
import initSettings from '../utils/initSettings'
import fs from 'fs-extra'

export default createStore({
    state() {
        if (!fs.existsSync('./settings.json')) {
            initSettings()
        }
        return {
            webwiewSrc: 'null',
            currentContentName: 'ControllerMain',
            settings: JSON.parse(fs.readFileSync('./settings.json', "utf-8")),
            COMPILE_DATE: COMPILE_DATE,
            COMPILE_NUMBER: COMPILE_NUMBER,
            notifications: []
        }
    },
    mutations: {
        webwiewSrc(state: any, payload: any) {
            state.webwiewSrc = payload
        },
        currentContentName(state, payload) {
            state.currentContentName = payload
        },
        // 只有窗口改json场景下才需带payload
        settings(state, payload) {
            if (payload) {
                state.settings = payload
            }

            fs.writeFileSync('./settings.json', JSON.stringify(state.settings))
        },
        COMPILE_DATE(state, payload) {
            state.COMPILE_DATE = payload
        }
    },
    getters: {
        currentContentName(state) {
            return state.currentContentName
        },
        webwiewSrc(state) {
            return state.webwiewSrc
        },
        settings(state) {
            return state.settings
        },
        'COMPILE_DATE'(state) {
            return state.COMPILE_DATE
        },
        'COMPILE_NUMBER'(state) {
            return state.COMPILE_NUMBER
        }
    }
    //   state: {
    //   },
    //   getters: {
    //   },
    //   mutations: {
    //   },
    //   actions: {
    //   },
    //   modules: {
    //   }
})
