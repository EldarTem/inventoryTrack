import { get, post, put, del } from './index'
import type { Organization } from '@/types/models'

interface CreateOrganization {
  name: string
  legalForm: string
  inn: string
  kpp: string
  ogrn: string
  address: string
  phone: string
  email: string
  type: string
  primaryContactId: string
}

export const organizationService = {
  async getAll(): Promise<Organization[]> {
    const response = await get<Organization[]>('/orgs')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<Organization> {
    const response = await get<Organization>(`/orgs/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(org: CreateOrganization): Promise<Organization> {
    const response = await post<Organization, CreateOrganization>('/orgs', org)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, org: CreateOrganization): Promise<Organization> {
    const response = await put<Organization, CreateOrganization>(`/orgs/${id}`, org)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/orgs/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async filter(type?: string): Promise<Organization[]> {
    const query = type !== undefined ? `?type=${type}` : ''
    const response = await get<Organization[]>(`/orgs/filter${query}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },
}
