<template>
    <!-- password对话框 -->
    <DialogGenerator title="输入密码" v-model:isDialogOpen="models.isPasswordDialogOpen" height="350px" width="600px"
        :isPersistent="true" :bottomActions="[
            { text: '确定', onClick: () => { onPasswordConfirm() } }
        ]" v-if="isPasswordAvailable()" class="app_lock_dialog">
        <template #mainContent>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field autofocus label="应用锁密码*" required density="compact" v-model="password"
                                :rules="[() => !!password || '请输入密码']" ref="passwordInputView"
                                :type="models.showPassword ? 'text' : 'password'"
                                :append-icon="models.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append="models.showPassword = !models.showPassword"
                                @keyup.enter="onPasswordConfirm()"></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
        </template>
    </DialogGenerator>

    <DialogGenerator v-if="!isPasswordAvailable()" title="设置应用锁密码" v-model:isDialogOpen="models.isPasswordDialogOpen"
        width="500px" :isPersistent="true">
        <template #mainContent>
            <div class="mx-auto">
                <div class="text-subtitle-2 text-medium-emphasis">设置应用锁密码</div>
                <v-text-field density="compact" placeholder="应用锁密码" prepend-inner-icon="mdi-lock"
                    :type="models.showPassword ? 'text' : 'password'"
                    :append-inner-icon="models.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="models.showPassword = !models.showPassword"
                    v-model="models.password1"></v-text-field>
                <div class="text-subtitle-2 text-medium-emphasis d-flex align-center justify-space-between">
                    再次输入密码以确认
                </div>
                <v-text-field :append-inner-icon="models.showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="models.showPassword ? 'text' : 'password'" density="compact" placeholder="应用锁密码"
                    prepend-inner-icon="mdi-lock" @click:append-inner="models.showPassword = !models.showPassword"
                    v-model="models.password2"></v-text-field>
                <v-card class="mb-12" color="surface-variant" variant="tonal">
                    <v-card-text class="text-medium-emphasis text-caption">
                        Note:
                        <br />
                        1.这个密码仅用来防止未授权人员访问隐域的界面、阻止其对这个应用进行操作，并不会参与数据加密。
                        <br />
                        2.密码以私有方式加密，外部应用无法解密你的密码，且密码全程不会以明文形式参与解锁判定。
                    </v-card-text>
                </v-card>
                <v-btn block class="mb-8" color="blue" size="large" variant="tonal" @click="onSetPasswordConfirm">
                    确认
                </v-btn>
                <v-card-text class="text-center">
                    <a class="text-blue text-decoration-none" @click="models.isPasswordDialogOpen = false">
                        跳过设置应用锁密码
                        <v-icon icon="mdi-chevron-right"></v-icon>
                    </a>
                </v-card-text>
            </div>
        </template>
    </DialogGenerator>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect } from "vue"
import { useSettingsStore } from "@/store/settings"
import { useEncryptionStore } from "@/store/encryption";
// import { safeStorage } from "electron";
import getDigest from "@/api/hash/getDigest";
import ASSERT from "@/utils/ASSERT";
import notification from "@/api/notification";
import emitter from "@/eventBus";

const settingsStore = useSettingsStore()
const encryptionStore = useEncryptionStore()
const models = reactive({
    isPasswordDialogOpen: false,
    showPassword: false,
    // 用于设置密码
    password1: null,
    password2: null // 重复输入密码以确认
})
const password = ref("")
const passwordInputView = ref()
let interval = null

// if (!safeStorage.isEncryptionAvailable()) {
//     error("未检测到安全环境，App拒绝运行")
//     throw new Error()
// }

const isPasswordAvailable = () => {
    return !!encryptionStore.appLockerKeyEncrypted
}

const verifyPassword = () => {
    ASSERT(isPasswordAvailable())
    // const RealMD5 = safeStorage.decryptString(encryptionStore.appLockerKeyEncrypted)
    const RealMD5 = encryptionStore.appLockerKeyEncrypted
    const InputMD5 = getDigest(Buffer.from(password.value), 'md5')
    return RealMD5 === InputMD5
}

const setPassword = (input: string) => {
    const InputMD5 = getDigest(Buffer.from(input), 'md5')
    // encryptionStore.setAppLockerKeyEncrypted(safeStorage.encryptString(InputMD5))
    encryptionStore.setAppLockerKeyEncrypted(InputMD5)
}

const onPasswordConfirm = () => {
    passwordInputView.value.validate(true)
    if (verifyPassword()) {
        password.value = ''
        models.isPasswordDialogOpen = false
    } else {
        notification.error("密码错误")
    }
}

const onSetPasswordConfirm = () => {
    if (!!models.password1 && !!models.password2 && models.password1 === models.password2) {
        setPassword(models.password1)
        models.password1 = ''
        models.password2 = ''
        models.isPasswordDialogOpen = false
    }
}

onMounted(() => {
    watchEffect(() => {
        if (settingsStore.getSetting("window_lock")) {
            models.isPasswordDialogOpen = true
            clearInterval(interval)
            if (settingsStore.getSetting("window_lock_scheduled")) {
                interval = setInterval(() => {
                    models.isPasswordDialogOpen = true
                }, settingsStore.getSetting("window_lock_interval") * 1e3 * 60)
            }
        }
    })
    emitter.on("Action::toggleAppLocker", (isReset: boolean) => {
        if (isReset) {
            encryptionStore.setAppLockerKeyEncrypted('')
        }
        if (settingsStore.getSetting("window_lock")) {
            models.isPasswordDialogOpen = true
        }
    })
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.app_lock_dialog .v-overlay__scrim {
    background-color: black !important;
    opacity: 1 !important;
}
</style>