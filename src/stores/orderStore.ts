// stores/orderStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/models'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])

  async function fetchAll() {
    orders.value = await orderService.getAll()
  }

  async function fetchById(id: string) {
    return await orderService.getById(id)
  }

  async function create(order: {
    number: string
    type: string
    status: string
    comment?: string
    warehouseId: string
    organizationId: string
    contactId: string
  }) {
    const newOrder = await orderService.create(order)
    orders.value.push(newOrder)
  }

  async function update(
    id: string,
    order: {
      number: string
      type: string
      status: string
      comment?: string
      warehouseId: string
      organizationId: string
      contactId: string
    },
  ) {
    const updatedOrder = await orderService.update(id, order)
    const index = orders.value.findIndex((o) => o.id === id)
    if (index !== -1) orders.value[index] = updatedOrder
  }

  async function remove(id: string) {
    await orderService.delete(id)
    orders.value = orders.value.filter((o) => o.id !== id)
  }

  async function approve(id: string) {
    const updatedOrder = await orderService.approve(id)
    const index = orders.value.findIndex((o) => o.id === id)
    if (index !== -1) orders.value[index] = updatedOrder
  }

  return {
    orders,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    approve,
  }
})
