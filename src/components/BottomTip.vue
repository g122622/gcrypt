<template>
    <div id="words" v-if="showWords && useBottomTip" @mouseover="handleMouseOver()" @mouseleave="handleMouseLeave()">
        {{ words }}
        <Transition name="tip-transition">
            <span v-if="showMoreDetails">
                出处: {{ fromWhere }}
                <IconBtn icon="mdi-refresh" tooltip="换一个句子" @click="queryData" size="small" />
            </span>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { useMainStore } from "@/store"
import { log, error } from "@/utils/gyConsole";
import axios from "axios";
import { ref, onMounted, onActivated, computed } from "vue";
const store = useMainStore()

const words = ref<string>("")
const fromWhere = ref<string>("")
const showWords = ref<boolean>(false)
const useBottomTip = computed<boolean>(() => {
    return store.settings.find(item => item.name === "use_bottom_tip").value as boolean
})
const showMoreDetails = ref<boolean>(false)

const queryData = async () => {
    if (useBottomTip.value) {
        try {
            // 这里使用一言的接口
            // 一言应该是我目前发现的最好的句子接口了
            // 内容质量相对更高，也不会因为请求频繁被403，更不需要购买key
            const { data: { hitokoto, from } } = await axios({
                method: "get",
                url: "https://v1.hitokoto.cn",
            })
            showWords.value = true
            words.value = hitokoto
            fromWhere.value = from
            log(hitokoto)
        } catch (e) {
            error(`从网络获取句子失败!只能显示之前的旧句子了 ${e.message}`)
        }
    }
}
onMounted(queryData)
onActivated(queryData)

const handleMouseOver = () => {
    showMoreDetails.value = true
}

const handleMouseLeave = () => {
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
    transition: all 0.5s;
    height: 45px;
    overflow: hidden;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.tip-transition-enter-active {
    transition: all 0.3s ease-out;
}

.tip-transition-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.tip-transition-enter-from,
.tip-transition-leave-to {
    opacity: 0;
}
</style>
