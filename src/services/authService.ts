import { post } from './index'
import type { User, Role } from '@/types/models'

interface LoginCredentials {
  login: string
  password: string
}

interface LoginResponse {
  id: string
  login: string
  role: { code: string; displayValue: string }
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await post<LoginResponse, LoginCredentials>('/users/login', credentials)

    if (response.error) {
      throw new Error(response.error)
    }


    const roleMap: Record<string, Role> = {
      manager: { code: 'manager', displayValue: 'Менеджер' },
      storekeeper: { code: 'storekeeper', displayValue: 'Кладовщик' },
      administrator: { code: 'administrator', displayValue: 'Администратор' },
    }

    const roleKey = response.data.role?.code || 'unknown'
    const role = roleMap[roleKey] || {
      code: roleKey,
      displayValue: response.data.role?.displayValue || roleKey,
    }


    return {
      id: response.data.id,
      login: response.data.login,
      role,
    }
  },

  async logout() {
  },
}
