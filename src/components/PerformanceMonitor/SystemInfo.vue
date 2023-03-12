<template>
    <div id="container">
        <v-list lines="one" density="compact">
            <v-list-item
            v-ripple
            v-for="(item,i) in infoData"
            :key="i"
            :title="item.key">
                <template v-slot:prepend>
                    <div style="text-align:right">
                        {{ item.value }}
                    </div>
                </template>
            </v-list-item>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import getCurrentProcessInfo from "@/api/getCurrentProcessInfo"
import lodash from "lodash"

// TODO 找到相应的lodash函数
const infoData = lodash.xxx(getCurrentProcessInfo())

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>
