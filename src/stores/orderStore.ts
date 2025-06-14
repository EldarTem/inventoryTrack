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
  }): Promise<Order> {
    const created = await orderService.create({
      ...order,
      createdById: order.contactId,
    })
    setTimeout(fetchAll, 200)
    return created
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
    await orderService.update(id, order)
    setTimeout(fetchAll, 200)
  }

  async function remove(id: string) {
    await orderService.delete(id)
    orders.value = orders.value.filter((o) => o.id !== id)
  }

  async function approve(id: string) {
    await orderService.approve(id)
    setTimeout(fetchAll, 200)
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
