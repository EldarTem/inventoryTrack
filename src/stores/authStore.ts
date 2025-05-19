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
    const userToStore = {
      id: userData.id,
      login: userData.login,
      role: {
        code: userData.role.code,
        displayValue: userData.role.displayValue,
      },
    }
    localStorage.setItem('user', JSON.stringify(userToStore))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
    authService.logout()
  }

  function restoreSession() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        if (
          parsedUser &&
          parsedUser.id &&
          parsedUser.login &&
          parsedUser.role &&
          typeof parsedUser.role.code === 'string' &&
          typeof parsedUser.role.displayValue === 'string'
        ) {
          user.value = parsedUser
        } else {
          localStorage.removeItem('user')
        }
      } catch (error) {
        console.error('AuthStore: Failed to parse user from localStorage:', error)
        localStorage.removeItem('user')
      }
    }
  }

  return { user, isAuthenticated, login, logout, restoreSession }
})
