import '@/assets/main.scss'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import OSMapPlugin from '@/plugins/osmap-plugin'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize auth store immediately after creating Pinia
const authStore = useAuthStore()
authStore.init()

app.use(ElementPlus)
app.use(OSMapPlugin)

app.use(router)

app.mount('#app')
