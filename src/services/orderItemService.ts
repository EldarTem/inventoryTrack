import { get, post, put, del } from './index'
import type { OrderItem } from '@/types/models'

interface CreateOrderItem {
  quantity: number
  price: number
  productId: string
  orderId: string
  sectionId: string
}

export const orderItemService = {
  async create(orderItem: CreateOrderItem): Promise<OrderItem> {
    const response = await post<OrderItem, CreateOrderItem>('/order-items', orderItem)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async createBulk(orderItems: CreateOrderItem[]): Promise<OrderItem[]> {
    const response = await post<OrderItem[], CreateOrderItem[]>('/order-items/bulk', orderItems)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, orderItem: CreateOrderItem): Promise<OrderItem> {
    const response = await put<OrderItem, CreateOrderItem>(`/order-items/${id}`, orderItem)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/order-items/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async getByOrderId(orderId: string): Promise<OrderItem[]> {
    const response = await get<OrderItem[]>(`/order-items/order/${orderId}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },
}
