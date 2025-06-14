import { get, post, put, del } from './index'
import type { Product } from '@/types/models'

interface CreateProduct {
  name: string
  code: string
  barcode: string
  description: string
  quantity: number
  price: number
  unit: string // Изменено с number на string
  categoryId: string
  sectionId: string
  supplierId: string
}

interface FilterProducts {
  name?: string
  categoryId?: string
  sectionId?: string
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await get<Product[]>('/products')
    console.log('productService.getAll response:', response)
    if (response.error) throw new Error(response.error)
    return response.data || []
  },

  async getById(id: string): Promise<Product> {
    const response = await get<Product>(`/products/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getByBarcode(barcode: string): Promise<Product> {
    const response = await get<Product>(`/products/barcode/${barcode}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(product: CreateProduct): Promise<Product> {
    console.log('Sending create request:', { dto: product })
    const response = await post<Product, CreateProduct>('/products', product)

    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, product: CreateProduct): Promise<Product> {
    console.log('Sending update request:', { dto: product })
    const response = await put<Product, { dto: CreateProduct }>(`/products/${id}`, { dto: product })
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/products/${id}`)
    if (response.error) throw new Error(response.error)
  },

  async filter(params: FilterProducts): Promise<Product[]> {
    const queryParams = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key]: String(value) }),
        {} as Record<string, string>,
      )
    const query = new URLSearchParams(queryParams).toString()
    const response = await get<Product[]>(`/products/filter?${query}`)
    console.log('productService.filter response:', response)
    if (response.error) throw new Error(response.error)
    return response.data || []
  },
}
