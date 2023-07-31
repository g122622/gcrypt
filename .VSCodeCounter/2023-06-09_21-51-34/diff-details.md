# Diff Details

Date : 2023-06-09 21:51:34

Directory f:\\gcrypt\\gcrypt\\src

Total : 57 files,  -36505 codes, 49 comments, 112 blanks, all -36344 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.eslintrc.js](/.eslintrc.js) | JavaScript | -30 | 0 | -1 | -31 |
| [README.md](/README.md) | Markdown | -27 | 0 | -10 | -37 |
| [babel.config.js](/babel.config.js) | JavaScript | -5 | 0 | -1 | -6 |
| [package-lock.json](/package-lock.json) | JSON | -36,942 | 0 | -1 | -36,943 |
| [package.json](/package.json) | JSON | -68 | 0 | -1 | -69 |
| [public/assets/about/chrome.svg](/public/assets/about/chrome.svg) | XML | -1 | 0 | 0 | -1 |
| [public/assets/about/element-plus-logo.svg](/public/assets/about/element-plus-logo.svg) | XML | -1 | 0 | 0 | -1 |
| [public/assets/about/vuetify.svg](/public/assets/about/vuetify.svg) | XML | -6 | 0 | -1 | -7 |
| [public/index.html](/public/index.html) | HTML | -27 | -1 | -4 | -32 |
| [run.bat](/run.bat) | Batch | -1 | 0 | 0 | -1 |
| [src/App.vue](/src/App.vue) | vue | -34 | 0 | -4 | -38 |
| [src/api/File.ts](/src/api/File.ts) | TypeScript | 55 | 6 | 13 | 74 |
| [src/api/FileWatcher.ts](/src/api/FileWatcher.ts) | TypeScript | 50 | 3 | 8 | 61 |
| [src/api/OpenMethodMgr.ts](/src/api/OpenMethodMgr.ts) | TypeScript | 48 | 2 | 9 | 59 |
| [src/api/TabsMgr.ts](/src/api/TabsMgr.ts) | TypeScript | 24 | 0 | 5 | 29 |
| [src/api/core/adapters/gcryptV1/KVPEngineJson.ts](/src/api/core/adapters/gcryptV1/KVPEngineJson.ts) | TypeScript | -8 | 6 | 1 | -1 |
| [src/api/core/adapters/gcryptV1/adapter.ts](/src/api/core/adapters/gcryptV1/adapter.ts) | TypeScript | 9 | 10 | 3 | 22 |
| [src/api/core/adapters/gcryptV1/encryptionEngineAES192.ts](/src/api/core/adapters/gcryptV1/encryptionEngineAES192.ts) | TypeScript | 2 | 0 | 0 | 2 |
| [src/api/core/types/AdapterBase.ts](/src/api/core/types/AdapterBase.ts) | TypeScript | 13 | 5 | 3 | 21 |
| [src/api/core/types/dirSingleItem.ts](/src/api/core/types/dirSingleItem.ts) | TypeScript | 0 | 0 | -1 | -1 |
| [src/api/registerBuiltinOpenMethods.ts](/src/api/registerBuiltinOpenMethods.ts) | TypeScript | 54 | 7 | 2 | 63 |
| [src/assets/json/defaultSettings.ts](/src/assets/json/defaultSettings.ts) | TypeScript | 16 | 0 | 0 | 16 |
| [src/background.js](/src/background.js) | JavaScript | -12 | 0 | -3 | -15 |
| [src/components/ActionToolBarBase.vue](/src/components/ActionToolBarBase.vue) | vue | -30 | -1 | -6 | -37 |
| [src/components/AdvancedNotification/NotificationCard.vue](/src/components/AdvancedNotification/NotificationCard.vue) | vue | -1 | 0 | 0 | -1 |
| [src/components/AdvancedNotification/NotificationManager.vue](/src/components/AdvancedNotification/NotificationManager.vue) | vue | 3 | 0 | 0 | 3 |
| [src/components/BackgroundImg.vue](/src/components/BackgroundImg.vue) | vue | -1 | 0 | 0 | -1 |
| [src/components/BottomTip.vue](/src/components/BottomTip.vue) | vue | -68 | -1 | -11 | -80 |
| [src/components/ContextMenu.vue](/src/components/ContextMenu.vue) | vue | -91 | -2 | -15 | -108 |
| [src/components/DialogGenerator.vue](/src/components/DialogGenerator.vue) | vue | -53 | -1 | -5 | -59 |
| [src/components/Dialogs/OpenMethodSelector.vue](/src/components/Dialogs/OpenMethodSelector.vue) | vue | 74 | 1 | 10 | 85 |
| [src/components/FileMgr/DialogMgr.vue](/src/components/FileMgr/DialogMgr.vue) | vue | -5 | 0 | 0 | -5 |
| [src/components/FileMgr/FileItem.vue](/src/components/FileMgr/FileItem.vue) | vue | 28 | 1 | 9 | 38 |
| [src/components/FileMgr/FileMgr.vue](/src/components/FileMgr/FileMgr.vue) | vue | 122 | 2 | 33 | 157 |
| [src/components/IconBtn.vue](/src/components/IconBtn.vue) | vue | -18 | -1 | -6 | -25 |
| [src/components/ImageViewer/ImageViewer.vue](/src/components/ImageViewer/ImageViewer.vue) | vue | 49 | 9 | 9 | 67 |
| [src/components/SystemBar.vue](/src/components/SystemBar.vue) | vue | 93 | 1 | 11 | 105 |
| [src/components/TabsMgr.vue](/src/components/TabsMgr.vue) | vue | 64 | 2 | 12 | 78 |
| [src/components/WebBrowser/WebBrowser.vue](/src/components/WebBrowser/WebBrowser.vue) | vue | 76 | 4 | 11 | 91 |
| [src/components/blank.vue](/src/components/blank.vue) | vue | -1 | 0 | 0 | -1 |
| [src/components/shared/ActionToolBarBase.vue](/src/components/shared/ActionToolBarBase.vue) | vue | 22 | 2 | 5 | 29 |
| [src/components/shared/BottomTip.vue](/src/components/shared/BottomTip.vue) | vue | 73 | 1 | 10 | 84 |
| [src/components/shared/ContextMenu.vue](/src/components/shared/ContextMenu.vue) | vue | 91 | 2 | 15 | 108 |
| [src/components/shared/DialogGenerator.vue](/src/components/shared/DialogGenerator.vue) | vue | 54 | 1 | 5 | 60 |
| [src/components/shared/IconBtn.vue](/src/components/shared/IconBtn.vue) | vue | 18 | 1 | 6 | 25 |
| [src/main.ts](/src/main.ts) | TypeScript | -4 | 3 | 1 | 0 |
| [src/store/index.ts](/src/store/index.ts) | TypeScript | -45 | -1 | -3 | -49 |
| [src/store/main.ts](/src/store/main.ts) | TypeScript | 14 | 0 | 2 | 16 |
| [src/store/settings.ts](/src/store/settings.ts) | TypeScript | 37 | 4 | 3 | 44 |
| [src/utils/getExtName.ts](/src/utils/getExtName.ts) | TypeScript | 9 | 0 | 2 | 11 |
| [src/utils/gyConsole.ts](/src/utils/gyConsole.ts) | TypeScript | 1 | 0 | 0 | 1 |
| [src/utils/toLegalRouterPath.ts](/src/utils/toLegalRouterPath.ts) | TypeScript | 5 | 4 | 3 | 12 |
| [src/views/About/AboutView.vue](/src/views/About/AboutView.vue) | vue | 1 | 0 | 0 | 1 |
| [src/views/Settings/SettingsView.vue](/src/views/Settings/SettingsView.vue) | vue | -31 | 1 | 0 | -30 |
| [src/views/StoreMgr/StoreMgr.vue](/src/views/StoreMgr/StoreMgr.vue) | vue | 3 | 0 | 0 | 3 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | -31 | -11 | -1 | -43 |
| [vue.config.js](/vue.config.js) | JavaScript | -72 | -10 | -5 | -87 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details