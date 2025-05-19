// stores/orderItemStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderItemService } from '@/services/orderItemService'
import type { OrderItem } from '@/types/models'

export const useOrderItemStore = defineStore('orderItem', () => {
  const orderItems = ref<OrderItem[]>([])

  async function fetchAllByOrder(orderId: string) {
    orderItems.value = await orderItemService.getAllByOrder(orderId)
  }

  async function fetchById(id: string) {
    return await orderItemService.getById(id)
  }

  async function create(orderItem: {
    productId: string
    orderId: string
    quantity: number
    price: number
    sectionId: string
  }) {
    const newOrderItem = await orderItemService.create(orderItem)
    orderItems.value.push(newOrderItem)
  }

  async function createBulk(
    orderItemsData: {
      productId: string
      orderId: string
      quantity: number
      price: number
      sectionId: string
    }[],
  ) {
    await orderItemService.createBulk(orderItemsData)
    orderItems.value = await orderItemService.getAllByOrder(orderItemsData[0].orderId)
  }

  async function update(
    id: string,
    orderItem: {
      productId: string
      orderId: string
      quantity: number
      price: number
      sectionId: string
    },
  ) {
    const updatedOrderItem = await orderItemService.update(id, orderItem)
    const index = orderItems.value.findIndex((oi) => oi.id === id)
    if (index !== -1) orderItems.value[index] = updatedOrderItem
  }

  async function remove(id: string) {
    await orderItemService.delete(id)
    orderItems.value = orderItems.value.filter((oi) => oi.id !== id)
  }

  return {
    orderItems,
    fetchAllByOrder,
    fetchById,
    create,
    createBulk,
    update,
    remove,
  }
})
