import { get, post, put, del } from './index'
import type { Warehouse, WarehouseSection } from '@/types/models'

interface CreateWarehouse {
  name: string
  address: string
  description: string
  ownerId: string
}

interface CreateWarehouseSection {
  code: string
  warehouseId: string
  description: string
}

export const warehouseService = {
  async getAll(): Promise<Warehouse[]> {
    const response = await get<Warehouse[]>('/warehouse')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<Warehouse> {
    const response = await get<Warehouse>(`/warehouse/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(warehouse: CreateWarehouse): Promise<Warehouse> {
    const response = await post<Warehouse, CreateWarehouse>('/warehouse', warehouse)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, warehouse: CreateWarehouse): Promise<Warehouse> {
    const response = await put<Warehouse, CreateWarehouse>(`/warehouse/${id}`, warehouse)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/warehouse/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async getAllSections(): Promise<WarehouseSection[]> {
    const response = await get<WarehouseSection[]>('/warehouse-section')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getSectionById(id: string): Promise<WarehouseSection> {
    const response = await get<WarehouseSection>(`/warehouse-section/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async createSection(section: CreateWarehouseSection): Promise<WarehouseSection> {
    const response = await post<WarehouseSection, CreateWarehouseSection>(
      '/warehouse-section',
      section,
    )
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async updateSection(id: string, section: CreateWarehouseSection): Promise<WarehouseSection> {
    const response = await put<WarehouseSection, CreateWarehouseSection>(
      `/warehouse-section/${id}`,
      section,
    )
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async deleteSection(id: string): Promise<void> {
    const response = await del<void>(`/warehouse-section/${id}`)
    if (response.error) throw new Error(response.error)
  },
}
