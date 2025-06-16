import { defineStore } from 'pinia'
import type { Inventory } from '@/types/models'
import { v4 as uuidv4 } from 'uuid'
import { useInventoryItemStore } from './inventoryItemStore'

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    inventories: [] as Inventory[],
  }),
  actions: {
    initialize() {
      const savedInventories = localStorage.getItem('inventories')
      if (savedInventories) {
        this.inventories = JSON.parse(savedInventories)
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('inventories', JSON.stringify(this.inventories))
    },
    fetchAll() {
      return this.inventories
    },
    create(inventoryData: Partial<Inventory>) {
      const newInventory: Inventory = {
        id: uuidv4(),
        number: inventoryData.number || '',
        status: inventoryData.status || { code: 'draft', displayValue: 'Черновик' },
        warehouse: inventoryData.warehouse || { id: '', displayValue: '' },
        createdBy: inventoryData.createdBy || { id: '', displayValue: '' },
        comment: inventoryData.comment || '',
        createdAt: inventoryData.createdAt || new Date().toISOString(),
      }
      this.inventories.push(newInventory)
      this.saveToLocalStorage()
      return newInventory
    },
    update(id: string, inventoryData: Partial<Inventory>) {
      const index = this.inventories.findIndex((inv) => inv.id === id)
      if (index !== -1) {
        this.inventories[index] = {
          ...this.inventories[index],
          ...inventoryData,
          status: inventoryData.status || this.inventories[index].status,
          warehouse: inventoryData.warehouse || this.inventories[index].warehouse,
          createdBy: inventoryData.createdBy || this.inventories[index].createdBy,
          createdAt: inventoryData.createdAt || this.inventories[index].createdAt,
        }
        this.saveToLocalStorage()
      }
    },
    remove(id: string) {
      this.inventories = this.inventories.filter((inv) => inv.id !== id)
      const inventoryItemStore = useInventoryItemStore()
      inventoryItemStore.removeByInventory(id)
      this.saveToLocalStorage()
    },
    complete(id: string) {
      const index = this.inventories.findIndex((inv) => inv.id === id)
      if (index !== -1) {
        this.inventories[index].status = { code: 'completed', displayValue: 'Завершено' }
        this.saveToLocalStorage()
      }
    },
  },
})
