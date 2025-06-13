import { defineStore } from 'pinia'
import { ref } from 'vue'
import { organizationService } from '@/services/organizationService'
import type { Organization } from '@/types/models'

export const useOrganizationStore = defineStore('organization', () => {
  const organizations = ref<Organization[]>([])

  async function fetchAll() {
    organizations.value = await organizationService.getAll()
  }

  async function fetchById(id: string) {
    return await organizationService.getById(id)
  }

  async function create(org: {
    name: string
    legalForm: string
    inn: string
    kpp: string
    ogrn: string
    address: string
    phone: string
    email: string
    type: string
    primaryContactId: string
  }) {
    await organizationService.create(org)
    setTimeout(fetchAll, 200)
  }

  async function update(
    id: string,
    org: {
      name: string
      legalForm: string
      inn: string
      kpp: string
      ogrn: string
      address: string
      phone: string
      email: string
      type: string
      primaryContactId: string
    },
  ) {
    await organizationService.update(id, org)
    setTimeout(fetchAll, 200)
  }

  async function remove(id: string) {
    await organizationService.delete(id)
    organizations.value = organizations.value.filter((o) => o.id !== id)
  }

  async function filter(type?: string) {
    organizations.value = await organizationService.filter(type)
  }

  return { organizations, fetchAll, fetchById, create, update, remove, filter }
})
