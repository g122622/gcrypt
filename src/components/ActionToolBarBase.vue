
<template>
    <v-app-bar density="compact">
        <v-app-bar-title>{{ this.ToolbarTitle }}</v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="this.$router.push('./home')">
            <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-heart</v-icon>
        </v-btn>
        <v-btn icon>
            <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
    </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
    name: 'ActionToolBarBase',
    props: {
        ToolbarTitle: String
    },
    data() {
        return {
        }
    }
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
