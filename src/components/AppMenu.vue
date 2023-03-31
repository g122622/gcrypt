<template>
                <v-menu>
                    <template v-slot:activator="{ props }">
                        <v-btn icon v-bind="props">
                            <v-icon>{{props.icon}}</v-icon>
                            <v-tooltip activator="parent" location="bottom">{{props.tooltip}}</v-tooltip>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="(item, index) in props.items" :key="index" :value="index"
                            @click="item.handler()">
                            <template v-slot:prepend>
                                <v-icon :icon="item.icon"></v-icon>
                            </template>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                            <v-tooltip activator="parent" location="bottom">{{ item.title }}</v-tooltip>
                        </v-list-item>
                    </v-list>
                </v-menu>
</template>

<script setup lang="ts">
import { ref } from "vue"

interface Props {
    
}
const props = defineProps<Props>()


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>