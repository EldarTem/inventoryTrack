import { defineStore } from 'pinia'
import type { InventoryItem } from '@/types/models'
import { v4 as uuidv4 } from 'uuid'

export const useInventoryItemStore = defineStore('inventoryItem', {
  state: () => ({
    inventoryItems: [] as InventoryItem[],
  }),
  actions: {
    initialize() {
      const savedItems = localStorage.getItem('inventoryItems')
      if (savedItems) {
        this.inventoryItems = JSON.parse(savedItems)
      }
    },
    saveToLocalStorage() {
      localStorage.setItem('inventoryItems', JSON.stringify(this.inventoryItems))
    },
    fetchAll() {
      return this.inventoryItems
    },
    fetchAllByInventory(inventoryId: string) {
      return this.inventoryItems.filter((item) => item.inventoryId === inventoryId)
    },
    create(inventoryItemData: Partial<InventoryItem>) {
      const newInventoryItem: InventoryItem = {
        id: uuidv4(),
        productId: inventoryItemData.productId || '',
        inventoryId: inventoryItemData.inventoryId || '',
        productName: inventoryItemData.productName || '',
        expectedQuantity: inventoryItemData.expectedQuantity || 0,
        actualQuantity: inventoryItemData.actualQuantity || 0,
        sectionId: inventoryItemData.sectionId || '',
        sectionName: inventoryItemData.sectionName || '',
      }
      this.inventoryItems.push(newInventoryItem)
      this.saveToLocalStorage()
      return newInventoryItem
    },
    createBulk(inventoryItemsData: Partial<InventoryItem>[]) {
      const newItems: InventoryItem[] = inventoryItemsData.map((item) => ({
        id: uuidv4(),
        productId: item.productId || '',
        inventoryId: item.inventoryId || '',
        productName: item.productName || '',
        expectedQuantity: item.expectedQuantity || 0,
        actualQuantity: item.actualQuantity || 0,
        sectionId: item.sectionId || '',
        sectionName: item.sectionName || '',
      }))
      this.inventoryItems.push(...newItems)
      this.saveToLocalStorage()
      return newItems
    },
    update(id: string, inventoryItemData: Partial<InventoryItem>) {
      const index = this.inventoryItems.findIndex((item) => item.id === id)
      if (index !== -1) {
        this.inventoryItems[index] = {
          ...this.inventoryItems[index],
          ...inventoryItemData,
          productId: inventoryItemData.productId || this.inventoryItems[index].productId,
          inventoryId: inventoryItemData.inventoryId || this.inventoryItems[index].inventoryId,
          productName: inventoryItemData.productName || this.inventoryItems[index].productName,
          expectedQuantity:
            inventoryItemData.expectedQuantity ?? this.inventoryItems[index].expectedQuantity,
          actualQuantity:
            inventoryItemData.actualQuantity ?? this.inventoryItems[index].actualQuantity,
          sectionId: inventoryItemData.sectionId || this.inventoryItems[index].sectionId,
          sectionName: inventoryItemData.sectionName || this.inventoryItems[index].sectionName,
        }
        this.saveToLocalStorage()
      }
    },
    remove(id: string) {
      this.inventoryItems = this.inventoryItems.filter((item) => item.id !== id)
      this.saveToLocalStorage()
    },
    removeByInventory(inventoryId: string) {
      this.inventoryItems = this.inventoryItems.filter((item) => item.inventoryId !== inventoryId)
      this.saveToLocalStorage()
    },
  },
})
