<template>
    <v-btn icon :size="props.size || 'default'" flat>
        <v-icon>{{ props.icon }}</v-icon>
        <v-tooltip activator="parent" location="bottom" v-if="props.tooltip">
            {{ props.tooltip }}
        </v-tooltip>
    </v-btn>
</template>

<script setup lang="ts">
// import { ref } from "vue"

interface Props {
    icon: string
    tooltip?: string,
    size?: string
}

const props = defineProps<Props>()

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>
