// services/orderService.ts
import { get, post, put, del } from './index'
import type { Order } from '@/types/models'

interface CreateOrder {
  number: string
  type: string
  status: string
  comment?: string
  warehouseId: string
  organizationId: string
  contactId: string
  createdById?: string
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const response = await get<Order[]>('/orders')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<Order> {
    const response = await get<Order>(`/orders/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(order: CreateOrder): Promise<Order> {
    const response = await post<Order, CreateOrder>('/orders', order)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, order: CreateOrder): Promise<Order> {
    const response = await put<Order, CreateOrder>(`/orders/${id}`, order)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/orders/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async approve(id: string): Promise<Order> {
    const response = await post<Order, undefined>(`/orders/${id}/approve`, undefined)
    if (response.error) throw new Error(response.error)
    return response.data
  },
}
