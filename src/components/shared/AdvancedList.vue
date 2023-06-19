<template>
    <div v-if="itemAmount >= 1">
        <v-list :lines="lines ?? 'one'" :density="density ?? 'compact'">
            <v-list-subheader v-if="subheader">
                {{ subheader }}
            </v-list-subheader>
            <slot />
        </v-list>
        <BottomTip v-if="useBottomTip ?? true" />
    </div>
    <div v-else>
        暂无内容
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface Props {
    density?: 'default' | 'comfortable' | 'compact',
    height?: string | number,
    useBottomTip?: boolean,
    itemAmount: number,
    subheader?: string,
    lines?: false | 'one' | 'two' | 'three'
}
const props = defineProps<Props>()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
