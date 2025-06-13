import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService } from '@/services/productService'
import type { Product } from '@/types/models'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])

  async function fetchAll() {
    try {
      const data = await productService.getAll()
      products.value = data || []
    } catch (error) {
      console.error('Failed to fetch products:', error)
      products.value = []
      throw error
    }
  }

  async function fetchById(id: string) {
    try {
      return await productService.getById(id)
    } catch (error) {
      console.error('Failed to fetch product by ID:', error)
      throw error
    }
  }

  async function fetchByBarcode(barcode: string) {
    try {
      return await productService.getByBarcode(barcode)
    } catch (error) {
      console.error('Failed to fetch product by barcode:', error)
      throw error
    }
  }

  async function create(product: {
    name: string
    code: string
    barcode: string
    description: string
    quantity: number
    price: number
    unit: string
    categoryId: string
    sectionId: string
    supplierId: string
  }) {
    await productService.create(product)
    setTimeout(fetchAll, 200)
  }

  async function update(
    id: string,
    product: {
      name: string
      code: string
      barcode: string
      description: string
      quantity: number
      price: number
      unit: string
      categoryId: string
      sectionId: string
      supplierId: string
    },
  ) {
    await productService.update(id, product)
    setTimeout(fetchAll, 200)
  }

  async function remove(id: string) {
    try {
      await productService.delete(id)
      products.value = products.value.filter((p) => p.id !== id)
    } catch (error) {
      console.error('Failed to delete product:', error)
      throw error
    }
  }

  async function filter(params: { name?: string; categoryId?: string; sectionId?: string }) {
    try {
      const data = await productService.filter(params)
      products.value = data || []
    } catch (error) {
      console.error('Failed to filter products:', error)
      products.value = []
      throw error
    }
  }

  return { products, fetchAll, fetchById, fetchByBarcode, create, update, remove, filter }
})
