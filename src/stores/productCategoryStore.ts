import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productCategoryService } from '@/services/productCategoryService'
import type { ProductCategory } from '@/types/models'

export const useProductCategoryStore = defineStore('productCategory', () => {
  const categories = ref<ProductCategory[]>([])

  async function fetchAll() {
    categories.value = await productCategoryService.getAll()
  }

  async function fetchById(id: string) {
    return await productCategoryService.getById(id)
  }

  async function create(category: { name: string; description: string }) {
    const newCategory = await productCategoryService.create(category)
    categories.value.push(newCategory)
  }

  async function update(id: string, category: { name: string; description: string }) {
    await productCategoryService.update(id, category)
    setTimeout(fetchAll, 200)
  }

  async function remove(id: string) {
    await productCategoryService.delete(id)
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  return { categories, fetchAll, fetchById, create, update, remove }
})
