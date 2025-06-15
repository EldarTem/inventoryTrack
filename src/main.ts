import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import { definePreset } from '@primevue/themes'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import '@fontsource/montserrat/400.css'
import '@fontsource/montserrat/500.css'
import '@fontsource/montserrat/700.css'
import './styles/primevue-theme.css'

import { useAuthStore } from '@/stores/authStore'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

// Определяем кастомный пресет
const CustomPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#E8EAF6', // Светлый оттенок
      100: '#C7CEEA',
      200: '#A3BFFA',
      300: '#7F9CF5',
      400: '#5A67D8',
      500: '#4C51BF', // Основной первичный цвет
      600: '#434AA8',
      700: '#3B4290',
      800: '#333A78',
      900: '#2A315F',
      950: '#1F2647',
    },
    content: {
      background: '#ffffff', // Фон контента (для таблиц, карточек)
      borderColor: '#E2E8F0', // Цвет границ
    },
  },
  components: {
    button: {
      rounded: '0.5rem', // border-radius: 8px
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },
    datatable: {
      header: {
        background: '{primary.500}', // Используем первичный цвет для заголовков таблицы
        color: '#ffffff',
      },
      row: {
        hover: {
          background: '{primary.50}', // Легкий оттенок при наведении
        },
      },
    },
  },
})

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const auth = useAuthStore()
auth.restoreSession()

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: CustomPreset,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

app.mount('#app')
