import { defineStore } from 'pinia'
import ElectronStore from "electron-store"
import EntryJson from '@/api/core/types/EntryJson'
import FileMgr from "@/components/FileMgr/FileMgr.vue"
import emitter from '@/eventBus'
import sharedUtils from '@/utils/sharedUtils'
import fs from "fs-extra"
import KVPEngineJson from '@/api/core/KVPEngines/KVPEngineJson'
import GcryptV1Adapter from '@/api/core/adapters/gcryptV1/adapter'
import EncryptionEngineAES192 from '@/api/core/encryptionEngines/EncryptionEngineAES192'
import notification from '@/api/notification'
import KVPEngineFolder from '@/api/core/KVPEngines/KVPEngineFolder'

interface StoreListItem extends EntryJson {
    storeEntryJsonSrc: string
}

// 初始化electron-store
const diskStore = new ElectronStore({
    name: "encryption",
    fileExtension: "json",
    encryptionKey: "gcrypt", // 对配置文件进行加密
    clearInvalidConfig: false, // 发生 SyntaxError  则清空配置
})

// 与encryption相关的状态&actions都放在这里
export const useEncryptionStore = defineStore("encryption", {
    state() {
        return {
            storeList: <Array<StoreListItem>>diskStore.get("storeList", []),
            appLockerKeyEncrypted: <string>diskStore.get("appLockerKeyEncrypted", null)
        }
    },
    actions: {
        save() {
            diskStore.set("storeList", this.storeList)
        },
        setAppLockerKeyEncrypted(key: string) {
            this.appLockerKeyEncrypted = key
            diskStore.set("appLockerKeyEncrypted", key)
        },
        async getInitedAdapter(entryFileSrc: string, password: string, entryJSONArg: EntryJson) {
            let adapter = null
            let KVPEngine = null
            let encryptionEngine = null
            const adapterGuid = sharedUtils.getHash(16)

            switch (entryJSONArg.config.adapter) {
                case 'gcryptV1':
                    adapter = new GcryptV1Adapter()
                    break;

                default:
                    break;
            }

            switch (entryJSONArg.config.KVPEngine) {
                case "KVPEngineJson":
                    KVPEngine = new KVPEngineJson()
                    break;

                case "KVPEngineFolder":
                    KVPEngine = new KVPEngineFolder()
                    break;

                default:
                    break;
            }

            switch (entryJSONArg.config.encryptionEngine) {
                case "encryptionEngineAES192":
                    encryptionEngine = new EncryptionEngineAES192()
                    break;

                case "EncryptionEngineAES192":
                    encryptionEngine = new EncryptionEngineAES192()
                    break;

                default:
                    break;
            }
            try {
                await adapter.initAdapter(entryFileSrc, password, KVPEngine, encryptionEngine, adapterGuid)
            } catch (e) {
                notification.error("密码错误")
            }
            return adapter
        },
        async openStore(storeSrc: string, adapter) {
            emitter.emit("Action::addTab", {
                name: storeSrc,
                component: FileMgr,
                icon: "mdi-folder",
                onClick: () => null,
                props: { adapter }
            })
        },
        /**
         * 检查这个src是否似曾相识，
         * 如果是第一次打开，
         * 则更新当前存储库表并写入electron-store
         * @param storeEntryJsonSrc
         */
        hasStore(storeEntryJsonSrc: string) {
            let finds = this.storeList.filter(item => { return item.storeEntryJsonSrc === storeEntryJsonSrc })
            return Boolean(finds.length)
        },
        /**
        * 根据src移除store
        * @param storeEntryJsonSrc
        */
        removeStore(storeEntryJsonSrc: string) {
            emitter.emit("showMsg", {
                level: "warning",
                msg: "确实要移除这个加密库吗<br>现在你有几秒时间来作出决定",
                actionButtons: [
                    {
                        title: '确定',
                        onClick: () => {
                            this.storeList = this.storeList.filter(item => { return item.storeEntryJsonSrc !== storeEntryJsonSrc })
                            this.save()
                            emitter.emit("showMsg", { level: "success", msg: "store移除成功，这并不会删除原文件！" })
                        },
                    },
                    {
                        title: '取消'
                    },
                ]
            })
        },

        importStore(storeEntryJsonSrc: string) {
            if (this.hasStore(storeEntryJsonSrc)) {
                fs.readFile(storeEntryJsonSrc).then((data) => {
                    this.storeList.push(JSON.parse(data.toString()))
                    this.save()
                    emitter.emit("showMsg",
                        {
                            level: "success",
                            msg: "导入加密库成功<br>请注意，元数据只有在输入密码成功进入后才会有效"
                        }
                    )
                })
            } else {
                emitter.emit("showMsg",
                    {
                        level: "error",
                        msg: "导入加密库失败<br>不允许重复导入"
                    }
                )
            }
        }
    }
})
