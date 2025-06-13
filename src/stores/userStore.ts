import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'
import type { User } from '@/types/models'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])

  async function fetchAll() {
    users.value = await userService.getAll()
  }

  async function fetchById(id: string) {
    return await userService.getById(id)
  }

  async function create(user: {
    login: string
    password: string
    role: string
    contactId: string
  }) {
    await userService.create(user)
    setTimeout(fetchAll, 200)
  }

  async function update(
    id: string,
    user: {
      login: string
      password?: string
      role: string
      contactId: string
    },
  ) {
    await userService.update(id, user)
    setTimeout(fetchAll, 200)
  }

  async function updateStatus(id: string, isActive: boolean) {
    await userService.updateStatus(id, isActive)
    const user = users.value.find((u) => u.id === id)
    if (user) user.isActive = isActive
  }

  async function remove(id: string) {
    await userService.delete(id)
    users.value = users.value.filter((u) => u.id !== id)
  }

  return { users, fetchAll, fetchById, create, update, updateStatus, remove }
})
