<template>
  <div class="suppliers-page">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <Button
          label="Добавить поставщика"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>

      <DataTable
        v-if="filteredSuppliers && filteredSuppliers.length"
        :value="filteredSuppliers"
        :columns="columns"
        row-key="id"
        paginator
        :rows="10"
        class="suppliers-table"
        scrollable
      >
        <Column field="name" header="Название" frozen />
        <Column field="legalForm" header="Организационно-правовая форма" />
        <Column field="inn" header="ИНН" />
        <Column field="kpp" header="КПП" />
        <Column field="ogrn" header="ОГРН" />
        <Column field="address" header="Адрес" />
        <Column header="Контакт">
          <template #body="{ data }">
            {{ data.primaryContact?.displayValue || "—" }}
          </template>
        </Column>
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
                @click.stop="deleteSupplier(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="no-data">
        <p>Поставщики отсутствуют</p>
        <Button
          label="Создать первого поставщика"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <SupplierModal
        v-if="showModal"
        :visible="showModal"
        :supplier="selectedSupplier"
        :isEdit="isEditMode"
        @save="saveSupplier"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useToast } from "primevue/usetoast";
import SupplierModal from "@/components/widgets/SupplierModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { Organization } from "@/types/models";

const organizationStore = useOrganizationStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedSupplier = ref<Organization | null>(null);

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

const filteredSuppliers = computed(() => {
  let result = organizationStore.organizations || [];
  if (filters.value.search) {
    result = result.filter((s) =>
      s.name?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  return result;
});

const columns = [
  { field: "name", header: "Название" },
  { field: "primaryContact.displayValue", header: "Контакт" },
  { field: "address", header: "Адрес" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log("Fetching all organizations...");
    await organizationStore.fetchAll();
    console.log("Organizations fetched:", organizationStore.organizations);
  } catch (err) {
    error.value =
      "Не удалось загрузить поставщиков: " +
      (err instanceof Error ? err.message : "Неизвестная ошибка");
    console.error("Fetch error:", error.value);
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
  selectedSupplier.value = {
    id: "",
    name: "Новый поставщик",
    legalForm: "ООО",
    inn: "",
    kpp: "",
    ogrn: "",
    address: "",
    phone: "",
    email: "",
    type: { code: "supplier", displayValue: "Поставщик" },
    primaryContact: { id: "", displayValue: "" },
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(supplier: Organization) {
  selectedSupplier.value = { ...supplier };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedSupplier.value = null;
}

async function saveSupplier(supplier: Organization) {
  try {
    const supplierData = {
      name: supplier.name,
      legalForm: supplier.legalForm,
      inn: supplier.inn,
      kpp: supplier.kpp,
      ogrn: supplier.ogrn,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      type: supplier.type.code,
      primaryContactId: supplier.primaryContact.id,
    };
    if (isEditMode.value) {
      await organizationStore.update(supplier.id, supplierData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Поставщик обновлен",
        life: 3000,
      });
    } else {
      await organizationStore.create(supplierData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Поставщик создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить поставщика: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedSupplier.value = null;
  }
}

async function deleteSupplier(id: string) {
  try {
    await organizationStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Поставщик удален",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить поставщика: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}
</script>


