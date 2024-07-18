<template>
    <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props" variant="flat">
                <v-icon>mdi-magnify</v-icon>
                <v-tooltip activator="parent" location="bottom">搜索</v-tooltip>
            </v-btn>
        </template>
        <v-card width="300px">
            <AdvancedTextField label="搜索..." prepend-inner-icon="mdi-magnify" v-model:currentInput="searchWord"
                density="compact">
            </AdvancedTextField>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">
import { computed, defineEmits } from "vue"
import AdvancedTextField from "@/components/shared/AdvancedTextField.vue"

interface Props {
    searchWord: string,
}
const props = defineProps<Props>()
const emit = defineEmits(['update:searchWord'])
const searchWord = computed({
    get: () => props.searchWord,
    set: (value: string) => emit('update:searchWord', value)
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
