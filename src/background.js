/* eslint-disable @typescript-eslint/no-this-alias */
'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const Store = require('electron-store');

class ApplicationMain {
    initProperties() {
        this.windowConfigStore = null
        this.mainStore = null
        this.shadeWindow = null
        this.hasShade = false
        this.shadeWindow = null
        this.scrSize = null
        this.mainWindow = null
    }

    initElectronStore() {
        Store.initRenderer();
        this.windowConfigStore = new Store({
            name: "windowConfig",
            fileExtension: "json",
            clearInvalidConfig: true,
        })
        this.mainStore = new Store({
            name: "main",
            fileExtension: "json",
            clearInvalidConfig: true,
        })
    }

    initAppVersion() {
        this.mainStore.set("appVersion", app.getVersion())
    }

    registerSchemes() {
        // Scheme must be registered before the app is ready
        protocol.registerSchemesAsPrivileged([
            { scheme: 'app', privileges: { secure: true, standard: true } }
        ])
    }

    async createWindow() {
        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            width: this.windowConfigStore.get("width", 1100),
            height: this.windowConfigStore.get("height", 650),
            backgroundColor: "#000000",
            title: "隐域-Gcrypt",
            titleBarStyle: 'hidden',
            webPreferences: {
                // Use pluginOptions.nodeIntegration, leave this alone
                // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
                //   nodeIntegration: (process.env
                //     .ELECTRON_NODE_INTEGRATION),
                //   contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
                nodeIntegration: true,
                contextIsolation: false,
                devTools: true,
            }
        })

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            // Load the url of the dev server if in development mode
            await this.mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
            if (!process.env.IS_TEST) this.mainWindow.webContents.openDevTools()
        } else {
            createProtocol('app')
            // Load the index.html when not in development
            this.mainWindow.loadURL('app://./index.html')
        }
    }

    initEvents() {
        const thisRef = this

        ipcMain.on('mainService', function (event, arg) {
            switch (arg.code) {
                case 'minimize':
                    // 缩小
                    thisRef.mainWindow.minimize()
                    break;
                case 'maximize':
                    // 放大
                    thisRef.mainWindow.maximize()
                    break;
                case 'close':
                    // 关闭
                    // 退出前保存窗口大小
                    thisRef.windowConfigStore.set("width", thisRef.mainWindow.getSize()[0])
                    thisRef.windowConfigStore.set("height", thisRef.mainWindow.getSize()[1])

                    thisRef.mainStore.set("appVersionOld", app.getVersion())
                    app.quit();
                    break;
                case 'full':
                    // 退出全屏
                    thisRef.mainWindow.unmaximize()
                    break;
                case 'reload':
                    thisRef.mainWindow.reload();

                    break;
                case 'relaunch':
                    app.relaunch();
                    app.quit();
                    break;
                case 'toggleDT':
                    thisRef.mainWindow.webContents.toggleDevTools();
                    break;
                case "showShade":
                    if (!thisRef.hasShade) {
                        thisRef.shadeWindow = new BrowserWindow({
                            width: thisRef.scrSize.width,
                            height: thisRef.scrSize.height,
                            transparent: false,
                            frame: false,
                            resizable: false,
                            maximizable: false,
                            backgroundColor: "#000000",
                            webPreferences: {
                                experimentalFeatures: true,
                                nodeIntegration: true, // 为了解决require 识别问题
                                contextIsolation: false,
                                webSecurity: false,
                                webviewTag: true
                            }
                        });
                        thisRef.hasShade = true;
                    }
                    break;
                case "closeShade":
                    if (thisRef.hasShade) {
                        thisRef.shadeWindow.destroy();
                        thisRef.hasShade = false;
                    }
                    break;
                case "setOnTop":
                    if (!thisRef.mainWindow.isAlwaysOnTop()) {
                        thisRef.mainWindow.setAlwaysOnTop(true)
                    }
                    break;
                case "unsetOnTop":
                    if (thisRef.mainWindow.isAlwaysOnTop()) {
                        thisRef.mainWindow.setAlwaysOnTop(false)
                    }
                    break;
            }
        });

        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
            // On macOS it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (BrowserWindow.getAllWindows().length === 0) thisRef.createWindow()
        })

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on('ready', async () => {
            thisRef.scrSize = screen.getPrimaryDisplay().workAreaSize;

            if (isDevelopment && !process.env.IS_TEST) {
                // Install Vue Devtools
                try {
                    // await installExtension(VUEJS3_DEVTOOLS)
                } catch (e) {
                    console.error('Vue Devtools failed to install:', e.toString())
                }
            }
        })

        // Exit cleanly on request from parent process in development mode.
        if (isDevelopment) {
            if (process.platform === 'win32') {
                process.on('message', (data) => {
                    if (data === 'graceful-exit') {
                        app.quit()
                    }
                })
            } else {
                process.on('SIGTERM', () => {
                    app.quit()
                })
            }
        }
    }

    async initAll() {
        this.initProperties()
        this.initElectronStore()
        this.initAppVersion()
        this.registerSchemes()
        app.on('ready', async () => {
            await this.createWindow()
        })
        this.initEvents()
    }

    constructor() {
        this.initAll()
    }
}

(function () {
    // eslint-disable-next-line no-new
    new ApplicationMain()
})()
