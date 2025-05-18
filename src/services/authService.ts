// services/authService.ts
import { post } from './index'
import type { User, Role } from '@/types/models'

interface LoginCredentials {
  login: string
  password: string
}

interface LoginResponse {
  id: string
  login: string
  role: string // API returns role as a string
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await post<LoginResponse, LoginCredentials>('/users/login', credentials)

    if (response.error) {
      throw new Error(response.error)
    }

    // Map string role to Role object
    const roleMap: Record<string, Role> = {
      manager: { code: 'manager', displayValue: 'Менеджер' },
      storekeeper: { code: 'storekeeper', displayValue: 'Кладовщик' },
      Administrator: { code: 'Administrator', displayValue: 'Администратор' },
    }

    const role = roleMap[response.data.role] || {
      code: response.data.role,
      displayValue: response.data.role, // Fallback if role is not in map
    }

    return {
      id: response.data.id,
      login: response.data.login,
      role, // Return Role object
    }
  },

  async logout() {
    // API для логаута отсутствует
  },
}
