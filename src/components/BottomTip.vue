<template>
    <div id="words" v-if="showWords && useBottomTip">
        {{ words }}
    </div>
</template>

<script setup lang="ts">
import store from "@/store";
import { log, error } from "@/utils/gyConsole";
import axios from "axios";
import { ref, onMounted, onActivated, computed } from "vue";

const words = ref<string>("")
const showWords = ref<boolean>(false)
const useBottomTip = computed<boolean>(() => {
    return store.state.settings.find(item => item.name === "use_bottom_tip").value
})

const queryData = async () => {
    if (useBottomTip.value) {
        let response
        try {
            response = await axios({
                method: "get",
                url: "https://v1.hitokoto.cn",
            })
            showWords.value = true
            log(response.data.hitokoto)
            words.value = response.data.hitokoto
        } catch (e) {
            error(`从网络获取句子失败!只能显示之前的旧句子了 ${e.message}`)
        }
    }
}

onMounted(queryData)
onActivated(queryData)
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#words {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
    font-size: 0.85em;
    opacity: 0.7
}
</style>
