import { defineStore } from 'pinia'
import { ref } from 'vue'
import { warehouseService } from '@/services/warehouseService'
import type { Warehouse, WarehouseSection } from '@/types/models'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses = ref<Warehouse[]>([])
  const sections = ref<WarehouseSection[]>([])

  async function fetchAll() {
    warehouses.value = await warehouseService.getAll()
  }

  async function fetchById(id: string) {
    return await warehouseService.getById(id)
  }

  async function create(warehouse: {
    name: string
    address: string
    description: string
    ownerId: string
  }) {
    const newWarehouse = await warehouseService.create(warehouse)
    warehouses.value.push(newWarehouse)
  }

  async function update(
    id: string,
    warehouse: { name: string; address: string; description: string; ownerId: string },
  ) {
    const updatedWarehouse = await warehouseService.update(id, warehouse)
    const index = warehouses.value.findIndex((w) => w.id === id)
    if (index !== -1) warehouses.value[index] = updatedWarehouse
  }

  async function remove(id: string) {
    await warehouseService.delete(id)
    warehouses.value = warehouses.value.filter((w) => w.id !== id)
  }

  async function fetchAllSections() {
    sections.value = await warehouseService.getAllSections()
  }

  async function fetchSectionById(id: string) {
    return await warehouseService.getSectionById(id)
  }

  async function createSection(section: {
    code: string
    warehouseId: string
    description: string
  }) {
    const newSection = await warehouseService.createSection(section)
    sections.value.push(newSection)
  }

  async function updateSection(
    id: string,
    section: { code: string; warehouseId: string; description: string },
  ) {
    const updatedSection = await warehouseService.updateSection(id, section)
    const index = sections.value.findIndex((s) => s.id === id)
    if (index !== -1) sections.value[index] = updatedSection
  }

  async function removeSection(id: string) {
    await warehouseService.deleteSection(id)
    sections.value = sections.value.filter((s) => s.id !== id)
  }

  return {
    warehouses,
    sections,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    fetchAllSections,
    fetchSectionById,
    createSection,
    updateSection,
    removeSection,
  }
})
