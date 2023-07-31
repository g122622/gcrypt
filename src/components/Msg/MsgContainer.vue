<template>
    <div id="msg_container">
        <PopMsg v-for="item in msg_list" :key="item.msg + Math.random().toString" :arg="item">
        </PopMsg>
    </div>
</template>

<script lang="ts">
import PopMsg from "./PopMsg.vue"
import { reactive } from "vue";

export default {
    name: 'MsgContainer',
    components: {
        PopMsg
    },
    mounted() {
        // 显示消息 全局方法
        // emitter.on("showMsg", ({ level, msg }) => {
        //     if (level === "error") {
        //         error(msg)
        //     }
        //     const guid = Math.random().toString();
        //     this.msg_list.push({ level, msg, guid });

        //     // 删除消息
        //     setTimeout(() => {
        //         this.msg_list.forEach((element, index) => {
        //             if (element.guid === guid) {
        //                 // document.querySelector(".el-alert__close-btn").click();
        //                 this.msg_list.splice(index, 1);
        //             }
        //         })
        //     }, 5000);
        // })
    },
    data() {
        return {
            msg_list: reactive([])
        }
    },
    methods: {
    }
}
</script>

<style scoped lang="less">
#msg_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 95%;
    position: absolute;
}
</style>
