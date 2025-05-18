import { get, post, put, del } from './index'
import type { Order, OrderStatus } from '@/types/models'

interface CreateOrder {
  number: string
  type: number
  comment?: string
  warehouseId: string
  organizationId: string
  contactId: string
}

interface FilterOrders {
  status?: number
  warehouseId?: string
  approvedFrom?: string
  approvedTo?: string
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

  async approve(id: string): Promise<{ id: string; status: OrderStatus; approvedAt: string }> {
    const response = await post<{ id: string; status: OrderStatus; approvedAt: string }, undefined>(
      `/orders/${id}/approve`,
      undefined,
    )
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async filter(params: FilterOrders): Promise<Order[]> {
    const queryParams = Object.entries(params)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, value]) => value !== undefined)
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
        {} as Record<string, string>,
      )
    const query = new URLSearchParams(queryParams).toString()
    const response = await get<Order[]>(`/orders/filter?${query}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },
}
