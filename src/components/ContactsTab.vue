<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useContactStore } from "@/stores/contactStore";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import ContactModal from "@/components/widgets/ContactModal.vue";
import type { PersonContact } from "@/types/models";

const contactStore = useContactStore();
const toast = useToast();
const confirm = useConfirm();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedContact = ref<PersonContact | null>(null);

const columns = [
  { field: "fullName", header: "ФИО" },
  { field: "position", header: "Должность" },
  { field: "phone", header: "Телефон" },
  { field: "email", header: "Email" },
  { field: "organization.displayValue", header: "Организация" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await contactStore.fetchAll();
  } catch (err) {
    error.value =
      "Не удалось загрузить контакты: " +
      (err instanceof Error ? err.message : "Неизвестная ошибка");
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: error.value,
      life: 3000,
    });
  } finally {
    isLoading.value = false;
  }
});

function openCreateModal() {
  selectedContact.value = {
    id: "",
    fullName: "",
    position: "",
    phone: "",
    email: "",
    organization: undefined,
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(contact: PersonContact) {
  selectedContact.value = { ...contact };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedContact.value = null;
}

async function saveContact(contact: PersonContact) {
  try {
    const contactData = {
      fullName: contact.fullName,
      position: contact.position,
      phone: contact.phone,
      email: contact.email,
      organizationId: contact.organization?.id,
    };
    if (isEditMode.value) {
      await contactStore.update(contact.id, contactData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Контакт обновлен",
        life: 3000,
      });
    } else {
      await contactStore.create(contactData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Контакт создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить контакт: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedContact.value = null;
  }
}

function confirmDelete(id: string) {
  confirm.require({
    message: "Вы уверены, что хотите удалить этот контакт?",
    header: "Подтверждение удаления",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Да",
    rejectLabel: "Нет",
    accept: async () => {
      try {
        await contactStore.remove(id);
        toast.add({
          severity: "success",
          summary: "Успех",
          detail: "Контакт удален",
          life: 3000,
        });
      } catch (err) {
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail:
            "Не удалось удалить контакт: " +
            (err instanceof Error ? err.message : "Неизвестная ошибка"),
          life: 3000,
        });
      }
    },
  });
}
</script>

<template>
  <div class="contacts-tab">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <Button
          label="Добавить контакт"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <DataTable
        v-if="contactStore.contacts?.length"
        :value="contactStore.contacts"
        :columns="columns"
        row-key="id"
        paginator
        :rows="10"
        class="contacts-table"
        scrollable
      >
        <Column field="fullName" header="ФИО" />
        <Column field="position" header="Должность" />
        <Column field="phone" header="Телефон" />
        <Column field="email" header="Email" />
        <Column field="organization.displayValue" header="Организация" />
        <Column header="Действия">
          <template #body="{ data }">
            <div class="actions-container">
              <Button
                icon="pi pi-pencil"
                severity="warning"
                class="p-button-sm"
                @click.stop="openEditModal(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                class="p-button-sm"
                @click.stop="confirmDelete(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="no-data">
        <p>Контакты отсутствуют</p>
        <Button
          label="Создать первый контакт"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <ContactModal
        v-if="showModal"
        :visible="showModal"
        :contact="selectedContact"
        :isEdit="isEditMode"
        @save="saveContact"
        @cancel="closeModal"
      />
      <ConfirmDialog />
    </div>
  </div>
</template>
