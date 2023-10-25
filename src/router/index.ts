/* eslint-disable dot-notation */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/store'
    },
    {
        path: '/home',
        redirect: '/store'
    },
    {
        path: '/about',
        name: 'about',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About/AboutView.vue')
    },
    {
        path: '/settings',
        name: 'settings',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "settings" */ '../views/Settings/SettingsView.vue')
    },
    {
        path: '/store',
        name: 'store',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "store" */ '../views/StoreMgr/StoreMgr.vue'),
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
