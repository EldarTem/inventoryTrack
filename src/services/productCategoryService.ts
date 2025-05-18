import { get, post, put, del } from './index'
import type { ProductCategory } from '@/types/models'

interface CreateProductCategory {
  name: string
  description: string
}

export const productCategoryService = {
  async getAll(): Promise<ProductCategory[]> {
    const response = await get<ProductCategory[]>('/categories')
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async getById(id: string): Promise<ProductCategory> {
    const response = await get<ProductCategory>(`/categories/${id}`)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async create(category: CreateProductCategory): Promise<ProductCategory> {
    const response = await post<ProductCategory, CreateProductCategory>('/categories', category)
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async update(id: string, category: CreateProductCategory): Promise<ProductCategory> {
    const response = await put<ProductCategory, CreateProductCategory>(
      `/categories/${id}`,
      category,
    )
    if (response.error) throw new Error(response.error)
    return response.data
  },

  async delete(id: string): Promise<void> {
    const response = await del<void>(`/categories/${id}`)
    if (response.error) throw new Error(response.error)
  },
}
