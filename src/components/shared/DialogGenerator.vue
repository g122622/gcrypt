<template>
    <v-dialog v-model="isDialogOpen" :persistent="props.isPersistent || false" :width="props.width || 600"
        :height="props.height || 400">
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">{{ props.title }}</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <slot name="mainContent" />
                    </v-row>
                </v-container>
                <slot name="footer" />
                <small v-if="props.footer">*{{ props.footer }}</small>
            </v-card-text>
            <v-card-actions v-if="props.bottomActions">
                <v-spacer></v-spacer>
                <v-btn v-for="(item, index) in props.bottomActions" color="blue-darken-1" variant="text"
                    @click="item.onClick" :key="index">
                    {{ item.text }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from "vue"
import dialogBottomAction from "@/types/dialogBottomAction"

interface Props {
    isDialogOpen: boolean,
    footer?: string,
    title: string,
    bottomActions?: Array<dialogBottomAction>,
    isPersistent?: boolean,
    width?: string,
    height?: string
}
const props = defineProps<Props>()
const emit = defineEmits(['update:isDialogOpen'])
const isDialogOpen = computed({
    get() {
        return props.isDialogOpen
    },
    set(value) {
        emit('update:isDialogOpen', value)
    }
})

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.v-card {
    padding: 15px;
}
</style>
