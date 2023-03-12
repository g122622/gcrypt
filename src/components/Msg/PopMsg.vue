<template>
    <!-- <div class="PopMsg">
            {{ arg.msg }}
        </div> -->
    <transition name="msg-transition">
        <div v-if="show" class="PopMsg">
            <v-alert density="compact" :type="arg.level">{{ arg.msg }}</v-alert>
        </div>

    </transition>
</template>

<script lang="ts">
import { ref } from 'vue';
// interface Msg {
//     level: string,
//     level: string
// }

export default {
    name: 'PopMsg',
    props: {
        arg: Object
    },
    mounted() {
        this.show = true;
        setTimeout(() => {
            this.show = false
        }, 3000);
    },
    data() {
        return {
            show: ref(false)
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.PopMsg {
    margin: 7px;
    text-align: left;
    z-index: 99999999999;
}

/* 可以为进入和离开动画设置不同的持续时间和动画函数 */
.msg-transition-enter-active {
    transition: all 0.3s ease-out;
}

.msg-transition-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.msg-transition-enter-from,
.msg-transition-leave-to {
    transform: translateY(-20px);
    opacity: 0;
}
</style>
