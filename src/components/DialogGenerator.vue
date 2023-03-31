<template>
    <v-dialog v-model="props.isDialogOpen" :persistent="props.isPersistent || ">
        <v-card density="compact">
            <v-card-title>
                <span class="text-h6">{{props.title}}</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <slot name="mainContent" />
                    </v-row>
                </v-container>
                <small>*{{props.footer}}</small>
            </v-card-text>
            <v-card-actions v-if="props.bottomActions">
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1"
                variant="text"
                @click="item.onClick"
                v-for="item in props.bottomActions"
                >
                    {{item.text}}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import dialogBottomAction from "@/types/dialogBottomAction"

interface Props {
    isDialogOpen:boolean,
    footer?:string,
    title:string,
    bottomActions?:Array<dialogBottomAction>,
    isPersistent?:boolean
}
const props = defineProps<Props>()
// const isDialogOpen=ref<boolean>(false)

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less"></style>