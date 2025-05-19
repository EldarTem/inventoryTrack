import { get, post, put, del } from './index'
import type { User, Contact } from '@/types/models'

interface CreateUser {
  login: string
  password?: string
  role: string
  contactId: string | null
}

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await get<User[]>('/users')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<User> {
    const response = await get<User>(`/users/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(user: CreateUser): Promise<User> {
    const response = await post<User, CreateUser>('/users', user)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, user: CreateUser): Promise<User> {
    const response = await put<User, CreateUser>(`/users/${id}`, user)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async updateStatus(id: string, isActive: boolean): Promise<void> {
    const response = await put<void, undefined>(
      `/users/${id}/status?isActive=${isActive}`,
      undefined,
    )
    if (response.error) throw new Error(response.error)
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/users/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async getContacts(): Promise<Contact[]> {
    const response = await get<Contact[]>('/contacts')
    if (response.error) throw new Error(response.error)
    return response.data
  },
}
