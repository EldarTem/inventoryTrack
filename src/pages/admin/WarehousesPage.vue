<template>
  <div class="warehouses-page">
    <h1>Страница складов и секций</h1>
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <TabView v-model:activeIndex="activeIndex">
        <TabPanel header="Склады" value="warehouses">
          <div class="actions-container">
            <Button
              v-if="filteredWarehouses && filteredWarehouses.length"
              label="Добавить склад"
              icon="pi pi-plus"
              class="p-button-lg"
              @click="openCreateModal"
            />
          </div>

          <DataTable
            v-if="filteredWarehouses && filteredWarehouses.length"
            :value="filteredWarehouses"
            :columns="columns"
            row-key="id"
            paginator
            :rows="10"
            class="warehouses-table"
          >
            <Column field="name" header="Название" />
            <Column field="address" header="Адрес" />
            <Column header="Владелец">
              <template #body="{ data }">
                {{ data.owner?.displayValue || "—" }}
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
                    @click.stop="confirmDelete(data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-else class="no-data">
            <p>Склады отсутствуют</p>
            <Button
              label="Создать первый склад"
              icon="pi pi-plus"
              class="p-button-lg"
              @click="openCreateModal"
            />
          </div>
        </TabPanel>
        <TabPanel header="Секции" value="sections">
          <WarehouseSectionsTab />
        </TabPanel>
      </TabView>
      <WarehouseModal
        v-if="showModal"
        :visible="showModal"
        :warehouse="selectedWarehouse"
        :isEdit="isEditMode"
        @save="saveWarehouse"
        @cancel="closeModal"
      />
      <ConfirmDialog />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import WarehouseModal from "@/components/widgets/WarehouseModal.vue";
import WarehouseSectionsTab from "@/components/WarehouseSectionsTab.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import ConfirmDialog from "primevue/confirmdialog";
import type { Warehouse } from "@/types/models";

const warehouseStore = useWarehouseStore();
const toast = useToast();
const confirm = useConfirm();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedWarehouse = ref<Warehouse | null>(null);
const activeIndex = ref(0);

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

const filteredWarehouses = computed(() => {
  let result = warehouseStore.warehouses || [];
  if (filters.value.search) {
    result = result.filter((w) =>
      w.name?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  return result;
});

const columns = [
  { field: "name", header: "Название" },
  { field: "address", header: "Адрес" },
  { field: "owner.displayValue", header: "Владелец" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await warehouseStore.fetchAll();
  } catch (err) {
    error.value =
      "Не удалось загрузить склады: " +
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
  selectedWarehouse.value = {
    id: "",
    name: "",
    address: "",
    description: "",
    owner: { id: "", displayValue: "" },
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(warehouse: Warehouse) {
  selectedWarehouse.value = { ...warehouse };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedWarehouse.value = null;
}

async function saveWarehouse(warehouse: Warehouse) {
  try {
    const warehouseData = {
      name: warehouse.name,
      address: warehouse.address,
      description: warehouse.description,
      ownerId: warehouse.owner.id,
    };
    if (isEditMode.value) {
      await warehouseStore.update(warehouse.id, warehouseData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Склад обновлен",
        life: 3000,
      });
    } else {
      await warehouseStore.create(warehouseData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Склад создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить склад: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedWarehouse.value = null;
  }
}

function confirmDelete(id: string) {
  confirm.require({
    message: "Вы уверены, что хотите удалить этот склад?",
    header: "Подтверждение удаления",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Да",
    rejectLabel: "Нет",
    accept: async () => {
      try {
        await warehouseStore.remove(id);
        toast.add({
          severity: "success",
          summary: "Успех",
          detail: "Склад удален",
          life: 3000,
        });
      } catch (err) {
        toast.add({
          severity: "error",
          summary: "Ошибка",
          detail:
            "Не удалось удалить склад: " +
            (err instanceof Error ? err.message : "Неизвестная ошибка"),
          life: 3000,
        });
      }
    },
  });
}
</script>
