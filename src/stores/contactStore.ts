import { defineStore } from 'pinia'
import { ref } from 'vue'
import { contactService } from '@/services/contactService'
import type { PersonContact } from '@/types/models'

export const useContactStore = defineStore('contact', () => {
  const contacts = ref<PersonContact[]>([])

  async function fetchAll() {
    contacts.value = await contactService.getAll()
  }

  async function fetchById(id: string) {
    return await contactService.getById(id)
  }

  async function create(contact: {
    fullName: string
    position: string
    phone: string
    email: string
    organizationId?: string
  }) {
    const newContactId = await contactService.create(contact)
    const newContact = await contactService.getById(newContactId)
    contacts.value.push(newContact)
  }

  async function update(
    id: string,
    contact: {
      fullName: string
      position: string
      phone: string
      email: string
      organizationId?: string
    },
  ) {
    await contactService.update(id, contact)
    const updatedContact = await contactService.getById(id)
    const index = contacts.value.findIndex((c) => c.id === id)
    if (index !== -1) contacts.value[index] = updatedContact
  }

  async function remove(id: string) {
    await contactService.delete(id)
    contacts.value = contacts.value.filter((c) => c.id !== id)
  }

  return { contacts, fetchAll, fetchById, create, update, remove }
})
