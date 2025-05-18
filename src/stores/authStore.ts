import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import type { User } from '@/types/models'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function login(credentials: { login: string; password: string }) {
    const userData = await authService.login(credentials)
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
    authService.logout()
  }

  function restoreSession() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  }

  return { user, isAuthenticated, login, logout, restoreSession }
})
