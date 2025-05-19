import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/700.css'
import './styles/primevue-theme.css'

import { useAuthStore } from '@/stores/authStore'
import ToastService from 'primevue/toastservice'
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const auth = useAuthStore()
auth.restoreSession()

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})
app.use(ToastService)

app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

app.mount('#app')
