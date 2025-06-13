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
    await orderItemService.create(orderItem)
    setTimeout(fetchAllByOrder, 200)
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
    await orderItemService.update(id, orderItem)
    setTimeout(fetchAllByOrder, 200)
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
