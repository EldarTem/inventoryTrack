import { get, post, put, del } from './index'
import type { PersonContact } from '@/types/models'

interface CreatePersonContact {
  fullName: string
  position: string
  phone: string
  email: string
  organizationId?: string
}

export const contactService = {
  async getAll(): Promise<PersonContact[]> {
    const response = await get<PersonContact[]>('/contacts')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<PersonContact> {
    const response = await get<PersonContact>(`/contacts/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(contact: CreatePersonContact): Promise<string> {
    const response = await post<string, CreatePersonContact>('/contacts', contact)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, contact: CreatePersonContact): Promise<void> {
    const response = await put<void, CreatePersonContact>(`/contacts/${id}`, contact)
    if (response.error) throw new Error(response.error)
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/contacts/${id}`)
    if (response.error) throw new Error(response.error)
  },
}
