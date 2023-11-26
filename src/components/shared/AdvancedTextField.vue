<template>
    <v-text-field v-model="currentInput" clear-icon="mdi-close-circle" clearable :required="required"
        :type="models.showText ? 'text' : 'password'" variant="solo-filled">
        <template #append-inner>
            <IconBtn icon="mdi-auto-fix" tooltip="自动填充" size="small" varient="plain">
                <!-- 自动填充选择菜单 -->
                <v-menu activator="parent">
                    <v-list>
                        <v-list-item v-for="item in autoFillItems" :key="item.text" :value="item" color="primary"
                            @click="item.onClick ? item.onClick() : currentInput = item.text">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title v-text="item.text"></v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </IconBtn>
            <IconBtn :icon="models.showText ? 'mdi-eye' : 'mdi-eye-off'" tooltip="文本可见性" size="small" varient="plain"
                @click="models.showText = !models.showText"></IconBtn>
        </template>
    </v-text-field>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from "vue"
import IconBtn from "./IconBtn.vue";
import dayjs from "dayjs";
import pickDate from "@/utils/shell/pickDate";

const props = defineProps<{
    id?: string,
    currentInput: string,
    required?: boolean
}>()
const emit = defineEmits(['update:currentInput'])

const currentInput = computed<string>({
    get() {
        return props.currentInput
    },
    set(value) {
        emit("update:currentInput", value)
    }
})
const models = reactive({
    showText: true
})

// date pick
const pickedDate = ref(new Date())
const autoFillItems = computed(() => [
    { text: dayjs(pickedDate.value).format("YYYYMMDD"), icon: 'mdi-calendar-month' },
    { text: dayjs(pickedDate.value).format("YYYY-MM-DD"), icon: 'mdi-calendar-month' },
    { text: dayjs(pickedDate.value).format("MMDD"), icon: 'mdi-calendar-month' },
    { text: dayjs(pickedDate.value).format("YYYYMMDD-HHmmss"), icon: 'mdi-clock' },
    { text: dayjs(pickedDate.value).format("YYYYMMDD-HH:mm:ss"), icon: 'mdi-clock' },
    { text: dayjs(pickedDate.value).format("HHmmss"), icon: 'mdi-clock' },
    { text: dayjs(pickedDate.value).format("HH:mm:ss"), icon: 'mdi-clock' },
    { text: '选择指定的日期', icon: 'mdi-dots-horizontal', onClick: () => { handlePickDate() } },
    { text: '清除指定的日期', icon: 'mdi-close', onClick: () => { clearPickDate() } },
])

const handlePickDate = async () => {
    pickedDate.value = await pickDate()
}
const clearPickDate = async () => {
    pickedDate.value = new Date()
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@inputHeight: 45px;

:deep(.v-field) {
    height: @inputHeight;
}

:deep(.v-input__details) {
    display: none;
}
</style>
