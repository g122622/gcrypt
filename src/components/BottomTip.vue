<template>
    <div id="words" v-if="showWords && useBottomTip"
    @mousevoer="handleMouseOver()"
    @mouseleave="handleMouseLeave()"
    >
        {{ words }}
        <span v-if="showMoreDetails">
            <v-spacer width="15px"/>
            作者: {{ author }}
            <IconBtn icon="mdi-refresh" tooltip="换一个句子" onClick="queryData" size="small"/>
        </span>
    </div>
</template>

<script setup lang="ts">
import store from "@/store";
import { log, error } from "@/utils/gyConsole";
import axios from "axios";
import { ref, onMounted, onActivated, computed } from "vue";

const words = ref<string>("")
const author = ref<string>("")
const showWords = ref<boolean>(false)
const useBottomTip = computed<boolean>(() => {
    return store.state.settings.find(item => item.name === "use_bottom_tip").value
})
const showMoreDetails = ref<boolean>(false)

const queryData = async () => {
    if (useBottomTip.value) {
        try {
            const { data: { hitokoto, author:authorname }} = await axios({
                method: "get",
                url: "https://v1.hitokoto.cn",
            })
            showWords.value = true
            log(hitokoto)
            words.value = hitokoto
            // TODO 响应是否有这个字段
            author.value= authorname
        } catch (e) {
            error(`从网络获取句子失败!只能显示之前的旧句子了 ${e.message}`)
        }
    }
}
onMounted(queryData)
onActivated(queryData)

const handleMouseOver=()=>{
    showMoreDetails.value = true
}

const handleMouseLeave=()=>{
    showMoreDetails.value = false
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
#words {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
    font-size: 0.85em;
    opacity: 0.7;
    transition: all 0.3s;//TODO 我想要左右过渡，这样行吗<
}
</style>