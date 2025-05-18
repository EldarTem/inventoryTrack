import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderItemService } from '@/services/orderItemService'
import type { OrderItem } from '@/types/models'

export const useOrderItemStore = defineStore('orderItem', () => {
  const orderItems = ref<OrderItem[]>([])

  async function create(orderItem: {
    quantity: number
    price: number
    productId: string
    orderId: string
    sectionId: string
  }) {
    const newItem = await orderItemService.create(orderItem)
    orderItems.value.push(newItem)
  }

  async function createBulk(
    orderItemsData: {
      quantity: number
      price: number
      productId: string
      orderId: string
      sectionId: string
    }[],
  ) {
    const newItems = await orderItemService.createBulk(orderItemsData)
    orderItems.value.push(...newItems)
  }

  async function update(
    id: string,
    orderItem: {
      quantity: number
      price: number
      productId: string
      orderId: string
      sectionId: string
    },
  ) {
    const updatedItem = await orderItemService.update(id, orderItem)
    const index = orderItems.value.findIndex((item) => item.productId === id)
    if (index !== -1) orderItems.value[index] = updatedItem
  }

  async function remove(id: string) {
    await orderItemService.delete(id)
    orderItems.value = orderItems.value.filter((item) => item.productId !== id)
  }

  async function fetchByOrderId(orderId: string) {
    orderItems.value = await orderItemService.getByOrderId(orderId)
  }

  return { orderItems, create, createBulk, update, remove, fetchByOrderId }
})
