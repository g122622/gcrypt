'use strict'

import { app, protocol, BrowserWindow, ipcMain, screen } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const Store = require('electron-store');

Store.initRenderer();

// 自己的变量
let hasShade = false;
let shadeWindow = null;
let scrSize = null
let windowConfigStore = new Store({
    name: "windowConfig", // 文件名称,默认 config
    fileExtension: "json", // 文件后缀,默认json
    //  cwd: Electron.app.getPath('userData'), // 文件位置,尽量不要动，默认情况下，它将通过遵循系统约定来选择最佳位置。C:\Users\xxx\AppData\Roaming\test\config.json
    clearInvalidConfig: true, // 发生 SyntaxError  则清空配置
})

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: windowConfigStore.get("width", 900),
        height: windowConfigStore.get("height", 500),
        backgroundColor: "#000000",
        title: "隐域-Gcrypt",
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#42424200',
            symbolColor: '#999999',
            height: 32
        },
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            //   nodeIntegration: (process.env
            //     .ELECTRON_NODE_INTEGRATION),
            //   contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true
        }
    })

    function sendMessage(code, data) {
        mainWindow.webContents.send('new-message', { code, data });
    }

    ipcMain.on('new-message', function (event, arg) {
        switch (arg.code) {
            case 'shrink':
                // 缩小
                mainWindow.minimize()
                break;
            case 'magnify':
                // 放大
                mainWindow.maximize()
                sendMessage('show-full-icon')
                break;
            case 'close':
                // 关闭
                app.quit();
                break;
            case 'full':
                // 退出全屏
                mainWindow.unmaximize()
                sendMessage('hide-full-icon')
                break;
            case 'reload':
                mainWindow.reload();

                break;
            case 'relaunch':
                app.relaunch();
                app.quit();
                break;
            case 'toggleDT':
                mainWindow.webContents.toggleDevTools();
                break;
            case "showShade":
                if (!hasShade) {
                    shadeWindow = new BrowserWindow({
                        width: scrSize.width,
                        height: scrSize.height,
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
                    hasShade = true;
                }
                break;
            case "closeShade":
                if (hasShade) {
                    shadeWindow.destroy();
                    hasShade = false;
                }
                break;
            case "setOnTop":
                if (!mainWindow.isAlwaysOnTop()) {
                    mainWindow.setAlwaysOnTop(true)
                }
                break;
            case "unsetOnTop":
                if (mainWindow.isAlwaysOnTop()) {
                    mainWindow.setAlwaysOnTop(false)
                }
                break;
        }
    });

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
        if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
    } else {
        createProtocol('app')
        // Load the index.html when not in development
        mainWindow.loadURL('app://./index.html')
    }

    // 退出后保存窗口大小
    app.on("will-quit", () => {
        windowConfigStore.set("width", mainWindow.getSize()[0])
        windowConfigStore.set("height", mainWindow.getSize()[1])
    })
}

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
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    scrSize = screen.getPrimaryDisplay().workAreaSize;

    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            // await installExtension(VUEJS3_DEVTOOLS)
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString())
        }
    }
    createWindow()
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
