<!-- SPDX-License-Identifier: GPL-3.0-or-later
License: GNU GPLv3 or later. See the license file in the project root for more information.
Copyright © 2021 - present Aleksey Hoffman. All rights reserved.
-->

<template>
    <div class="notification__container">
        <transition-group name="msg-transition">
            <notification-card v-for="notification in nonHiddenNotifications"
                :key="'notification-' + notification.cardHashID" :notification="notification"
                :scheduleNotificationForRemoval="scheduleNotificationForRemoval" location="screen"></notification-card>
        </transition-group>
    </div>
</template>

<script lang="ts">
import TimeUtils from '../../utils/timeUtils'
import NotificationCard from "./NotificationCard.vue";

export default {
    name: 'NotificationManager',
    components: {
        NotificationCard
    },
    data() {
        return {
            maxNotificationLimit: 30,
        }
    },
    mounted() {
        // adapter for my app
        this.$emitter.on('showMsg', payload => {
            let colorStatus: string
            let icon = 'mdi-information'
            switch (payload.level) {
                case "error":
                    colorStatus = "red"
                    icon = "mdi-close"
                    break;
                case "warning":
                    colorStatus = "yellow"
                    icon = "mdi-alert-box"
                    break;
                case "info":
                    colorStatus = "blue"
                    break;
                case "success":
                    colorStatus = "green"
                    icon = "mdi-check-circle"
                    break;

                default:
                    break;
            }
            let foo = {
                message: payload.msg,
                type: "html",
                title: payload.level,
                colorStatus,
                icon
            }
            this.initNotification(foo)
        })

        // to compatible with sigmaFM's original code
        this.$emitter.on('notification', payload => {
            this.initNotification(payload)
        })
        // 从store改写
        this.$emitter.on('HIDE_NOTIFICATION', payload => {
            this.HIDE_NOTIFICATION(payload)
        })
        this.$emitter.on('REMOVE_NOTIFICATION', payload => {
            this.REMOVE_NOTIFICATION(payload)
        })
        this.$emitter.on('RESET_NOTIFICATION_TIMERS', payload => {
            this.RESET_NOTIFICATION_TIMERS(payload)
        })
    },
    computed: {
        notifications() {
            // todo
            return this.$store.state.notifications
        },
        nonHiddenNotifications() {
            return [
                ...this.notifications.filter(item => !item.isHidden && !item.isPinned),
                ...this.notifications.filter(item => !item.isHidden && item.isPinned),
            ]
        }
    },
    methods: {
        initNotification(params) {
            const defaultParams = {
                hashID: this.$utils.getHash(),
                id: this.notifications.length + 1,
                action: 'add',
                type: '',
                title: '',
                message: '',
                icon: 'mdi-information',
                colorStatus: '',
                timeout: 5000,
                closeButton: true,
                isHidden: false,
                isStatic: false,
                isPinned: false,
                isUpdate: false,
                removeWhenHidden: true,
                actionButtons: [],
                props: {},
                onNotificationHide: null,
                timeoutData: {
                    ongoingTimeout: null,
                    secondsCounter: null,
                    secondsCounterInterval: null,
                    percentsCounter: null,
                    percentsCounterInterval: null
                }
            }
            const notification = { ...defaultParams, ...params }

            if (notification.action === 'hide') {
                this.$emitter.emit('HIDE_NOTIFICATION', this.getRequestedNotification(notification))
            } else if (notification.action === 'add') {
                this.addNotification(this.getRequestedNotification(notification))
            } else if (notification.action.includes('update')) {
                this.updateNotification(this.getRequestedNotification(notification), notification)
            }
        },
        getRequestedNotification(notification) {
            if (notification.action === 'hide') {
                return this.notifications.find(item => item.hashID === notification.hashID)
            } else if (notification.action === 'add') {
                return notification
            } else if (notification.action.includes('update')) {
                if (notification.action === 'update-by-type') {
                    return this.notifications.find(item => item.type === notification.type)
                } else if (notification.action === 'update-by-hash') {
                    return this.notifications.find(item => item.hashID === notification.hashID)
                }
            }
        },
        updateNotification(notificationToUpdate, notification) {
            if (notificationToUpdate === undefined) {
                this.addNotification(notification)
            } else {
                this.$emitter.emit('RESET_NOTIFICATION_TIMERS', notificationToUpdate)
                this.updateNotificationProperties(notificationToUpdate, notification)
                this.scheduleNotificationForRemoval(notificationToUpdate)
            }
        },
        updateNotificationProperties(notificationToUpdate, notification) {
            for (const [key, value] of Object.entries(notification)) {
                if (key !== 'isHidden' || notification.isStatic) {
                    notificationToUpdate[key] = value
                }
            }
        },
        addNotification(notification) {
            notification.cardHashID = this.$utils.getHash()
            this.removeOutdatedNotifications()
            this.notifications.unshift(notification)
            this.scheduleNotificationForRemoval(notification)
        },
        removeOutdatedNotifications() {
            if (this.notifications.length > this.maxNotificationLimit) {
                this.notifications.splice(this.notifications.length - 1, 1)
            }
        },
        scheduleNotificationForRemoval(notification) {
            notification.timeoutData.ongoingTimeout = new TimeUtils()
            if (notification.timeout !== 0) {
                // Set timeout
                notification.timeoutData.ongoingTimeout.timeout(() => {
                    this.$emitter.emit('HIDE_NOTIFICATION', notification)
                }, notification.timeout)
                this.initCounterUpdate(notification)
            }
        },
        initCounterUpdate(notification) {
            // Set timeout data immidiatelly
            notification.timeoutData.secondsCounter = Math.round(notification.timeoutData.ongoingTimeout.timeLeft() / 1000)
            notification.timeoutData.percentsCounter = notification.timeoutData.ongoingTimeout.percentsСompleted()

            // Keep updating timeout counter until timeout is finished
            notification.timeoutData.secondsCounterInterval = setInterval(() => {
                notification.timeoutData.secondsCounter = Math.round(notification.timeoutData.ongoingTimeout.timeLeft() / 1000)
                if (notification.timeoutData.secondsCounter <= 0) {
                    clearInterval(notification.timeoutData.secondsCounterInterval)
                }
            }, 1000)

            // Get remaining time every 100ms until timeout is finished
            notification.timeoutData.percentsCounterInterval = setInterval(() => {
                const millisecondsLeft = notification.timeoutData.ongoingTimeout.timeLeft()
                notification.timeoutData.percentsCounter = notification.timeoutData.ongoingTimeout.percentsСompleted()
                if (millisecondsLeft <= 0) {
                    clearInterval(notification.timeoutData.percentsCounterInterval)
                }
            }, 100)
        },
        // 从store分离下来的
        HIDE_NOTIFICATION(notification) {
            this.RESET_NOTIFICATION_TIMERS(notification)
            // Call onNotificationHide callback
            try { notification.onNotificationHide() } catch (error) { }

            if (notification.removeWhenHidden) {
                this.REMOVE_NOTIFICATION(notification)
            } else {
                notification.isHidden = true
            }
        },
        REMOVE_NOTIFICATION(notification) {
            if (['update-by-hash', 'add', 'hide'].includes(notification.action)) {
                const notificationIndex = this.$store.state.notifications.findIndex(item => item.hashID === notification.hashID)
                this.$store.state.notifications.splice(notificationIndex, 1)
            } else if (notification.action === 'update-by-type') {
                const notificationIndex = this.$store.state.notifications.findIndex(item => item.type === notification.type)
                this.$store.state.notifications.splice(notificationIndex, 1)
            }
        },
        RESET_NOTIFICATION_TIMERS(notification) {
            try {
                notification.timeoutData.ongoingTimeout.clear()
                clearInterval(notification.timeoutData.secondsCounterInterval)
                clearInterval(notification.timeoutData.percentsCounterInterval)
            } catch (error) { }
        }
    }
}
</script>

<style scoped lang="less">
.notification__container {
    position: fixed;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex-direction: column;
    width: 400px;
    bottom: 8px;
    right: 16px;
    /* move notifications above v-dialog */
    z-index: 300 !important;
    transition: all 0.5s;
    pointer-events: all;
}

.notification__container--raised {
    bottom: 36px;
}

/*
.notification-transition-enter-active {
    transition: all 0.5s ease;
}

.notification-transition-leave-active {
    transition: all 0s ease;
}

.notification-transition-enter,
.notification-transition-leave-to {
    opacity: 0;
    transform: translateX(256px);
} */

.msg-transition-enter-active {
    transition: all 0.3s ease-out;
}

.msg-transition-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.msg-transition-enter-from,
.msg-transition-leave-to {
    transform: translateY(20px);
    opacity: 0;
}
</style>
