import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/Home/HomeView.vue'

const routes: Array<RouteRecordRaw> = [
    {
        path: '/home',
        name: 'home',
        component: HomeView
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
        path: '/files',
        name: 'files',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "files" */ '../components/FileMgr/FileMgr.vue')
    },
    {
        path: '/store',
        name: 'store',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "store" */ '../views/StoreMgr/StoreMgr.vue')
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

export default router
