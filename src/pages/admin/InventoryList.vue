<template>
  <div class="inventory-page">
    <h1>Инвентаризация</h1>
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="filteredInventories && filteredInventories.length">
        <div class="actions-container">
          <Button
            label="Создать инвентаризацию"
            icon="pi pi-plus"
            class="p-button-lg"
            @click="openCreateModal"
          />
          <Button
            text
            icon="pi pi-plus"
            label="Раскрыть все"
            @click="expandAll"
          />
          <Button
            text
            icon="pi pi-minus"
            label="Свернуть все"
            @click="collapseAll"
          />
        </div>
        <DataTable
          v-model:filters="filters"
          v-model:expandedRows="expandedRows"
          :value="filteredInventories"
          dataKey="id"
          row-key="id"
          paginator
          showGridlines
          :rows="10"
          filterDisplay="menu"
          :loading="isLoading"
          :globalFilterFields="[
            'number',
            'status.displayValue',
            'warehouse.displayValue',
            'createdBy.displayValue',
            'comment',
          ]"
          class="inventory-table"
          scrollable
          scrollHeight="600px"
          @rowExpand="onRowExpand"
        >
          <template #header>
            <div class="header-table">
              <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Сбросить"
                outlined
                @click="clearFilter"
              />
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                  v-model="filters['global'].value"
                  placeholder="Поиск"
                />
              </IconField>
            </div>
          </template>
          <template #empty> Инвентаризации отсутствуют. </template>
          <template #loading>
            Загрузка инвентаризаций. Пожалуйста, подождите.
          </template>
          <Column expander style="width: 5rem; min-width: 5rem" />
          <Column field="number" header="Номер">
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                placeholder="Поиск по номеру"
              />
            </template>
          </Column>
          <Column
            field="status.displayValue"
            header="Статус"
            filterField="status.displayValue"
          >
            <template #body="{ data }">
              <Tag
                :value="data.status.displayValue"
                :severity="getStatusSeverity(data.status.code)"
              />
            </template>
            <template #filter="{ filterModel }">
              <Select
                v-model="filterModel.value"
                :options="statuses"
                placeholder="Выберите статус"
                showClear
              >
                <template #option="slotProps">
                  <Tag
                    :value="slotProps.option"
                    :severity="
                      getStatusSeverity(
                        slotProps.option === 'Черновик' ? 'draft' : 'completed'
                      )
                    "
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column
            field="warehouse.displayValue"
            header="Склад"
            filterField="warehouse.displayValue"
          >
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                placeholder="Поиск по складу"
              />
            </template>
          </Column>
          <Column
            field="createdBy.displayValue"
            header="Создал"
            filterField="createdBy.displayValue"
          >
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                placeholder="Поиск по создателю"
              />
            </template>
          </Column>
          <Column field="comment" header="Комментарий" filterField="comment">
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                placeholder="Поиск по комментарию"
              />
            </template>
          </Column>
          <Column
            field="createdAt"
            header="Дата создания"
            filterField="createdAt"
            dataType="date"
          >
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
            <template #filter="{ filterModel }">
              <DatePicker
                v-model="filterModel.value"
                dateFormat="dd.mm.yy"
                placeholder="дд.мм.гггг"
              />
            </template>
          </Column>
          <Column header="Действия" style="min-width: 12rem">
            <template #body="{ data }">
              <div class="actions-container">
                <Button
                  icon="pi pi-check"
                  severity="success"
                  class="p-button-sm"
                  @click.stop="completeInventory(data.id)"
                  :disabled="data.status.code === 'completed'"
                />
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
                  @click.stop="deleteInventory(data.id)"
                />
              </div>
            </template>
          </Column>
          <template #expansion="{ data }">
            <div class="p-4 inventory-items-table">
              <h5>Товары для инвентаризации {{ data.number }}</h5>
              <ProgressSpinner
                v-if="isLoadingInventoryItems[data.id]"
                class="loader"
              />
              <div v-else-if="inventoryItemsErrors[data.id]" class="error">
                {{ inventoryItemsErrors[data.id] }}
              </div>
              <div v-else>
                <div class="actions-container">
                  <Button
                    label="Добавить товар"
                    icon="pi pi-plus"
                    class="p-button-lg"
                    @click="openCreateInventoryItemModal(data)"
                  />
                </div>
                <DataTable
                  v-if="
                    inventoryItems[data.id] && inventoryItems[data.id].length
                  "
                  :value="inventoryItems[data.id]"
                  class="inventory-items-table"
                  scrollable
                  scrollHeight="400px"
                >
                  <Column
                    field="productName"
                    header="Товар"
                    style="min-width: 12rem"
                  />
                  <Column
                    field="expectedQuantity"
                    header="Ожидаемое количество"
                    style="min-width: 10rem"
                  />
                  <Column
                    field="actualQuantity"
                    header="Фактическое количество"
                    style="min-width: 10rem"
                  />
                  <Column
                    field="sectionName"
                    header="Секция"
                    style="min-width: 12rem"
                  />
                  <Column header="Действия" style="min-width: 12rem">
                    <template #body="{ data: item }">
                      <div class="actions-container">
                        <Button
                          icon="pi pi-pencil"
                          severity="warning"
                          class="p-button-sm"
                          @click.stop="openEditInventoryItemModal(item)"
                        />
                        <Button
                          icon="pi pi-trash"
                          severity="danger"
                          class="p-button-sm"
                          @click.stop="deleteInventoryItem(item.id)"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
                <div v-else class="no-data">
                  <p>Товары для инвентаризации отсутствуют</p>
                </div>
              </div>
            </div>
          </template>
        </DataTable>
      </div>
      <div v-else class="no-data">
        <p>Инвентаризации отсутствуют</p>
        <Button
          label="Создать первую инвентаризацию"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <InventoryManagementModal
        v-if="showModal"
        :visible="showModal"
        :inventory="selectedInventory"
        :is-edit="isEditMode"
        @save="onSave"
        @cancel="onCancel"
      />
      <InventoryItemModal
        v-if="showInventoryItemModal"
        :visible="showInventoryItemModal"
        :inventory-item="selectedInventoryItem"
        :is-edit="isInventoryItemEditMode"
        @save="onSaveInventoryItem"
        @cancel="onCancelInventoryItem"
      />
      <Toast />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useInventoryStore } from "@/stores/inventoryStore";
import { useInventoryItemStore } from "@/stores/inventoryItemStore";
import { useToast } from "primevue/usetoast";
import InventoryManagementModal from "@/components/widgets/InventoryManagementModal.vue";
import InventoryItemModal from "@/components/widgets/InventoryItemModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Toast from "primevue/toast";
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Tag from "primevue/tag";
import Select from "primevue/select";
import DatePicker from "primevue/datepicker";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";
import type { Inventory, InventoryItem } from "@/types/models";
import { v4 as uuidv4 } from "uuid";

const inventoryStore = useInventoryStore();
const inventoryItemStore = useInventoryItemStore();
const toast = useToast();

const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const showInventoryItemModal = ref(false);
const isInventoryItemEditMode = ref(false);
const selectedInventory = ref<Inventory | null>(null);
const selectedInventoryItem = ref<InventoryItem | null>(null);
const expandedRows = ref<{ [key: string]: boolean }>({});
const inventoryItems = ref<{ [key: string]: InventoryItem[] }>({});
const isLoadingInventoryItems = ref<{ [key: string]: boolean }>({});
const inventoryItemsErrors = ref<{ [key: string]: string }>({});

const statuses = ref(["Черновик", "Завершено"]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  number: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  "status.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  "warehouse.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  "createdBy.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  comment: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
  },
  createdAt: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
});

const filteredInventories = computed<Inventory[]>(() => {
  return inventoryStore.inventories ?? [];
});

async function onRowExpand(event: { data: Inventory }) {
  const inventoryId = event.data.id;
  if (!inventoryItems.value[inventoryId]) {
    isLoadingInventoryItems.value[inventoryId] = true;
    inventoryItemsErrors.value[inventoryId] = "";
    try {
      const items = await inventoryItemStore.fetchAllByInventory(inventoryId);
      inventoryItems.value[inventoryId] = items;
      toast.add({
        severity: "info",
        summary: "Товары загружены",
        detail: `Товары для инвентаризации ${event.data.number}`,
        life: 3000,
      });
    } catch (err) {
      inventoryItemsErrors.value[inventoryId] =
        "Не удалось загрузить товары: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка");
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: inventoryItemsErrors.value[inventoryId],
        life: 3000,
      });
    } finally {
      isLoadingInventoryItems.value[inventoryId] = false;
    }
  }
}

function expandAll() {
  expandedRows.value = filteredInventories.value.reduce(
    (acc, i) => ({ ...acc, [i.id]: true }),
    {}
  );
  filteredInventories.value.forEach((inventory) =>
    onRowExpand({ data: inventory })
  );
}

function collapseAll() {
  expandedRows.value = {};
}

function openCreateModal() {
  selectedInventory.value = {
    id: uuidv4(),
    number: "",
    status: { code: "draft", displayValue: "Черновик" },
    warehouse: { id: "", displayValue: "" },
    createdBy: { id: "", displayValue: "" },
    comment: "",
    createdAt: new Date().toISOString(),
  };
  selectedInventoryItem.value = null;
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(inventory: Inventory) {
  selectedInventory.value = { ...inventory };
  selectedInventoryItem.value = null;
  isEditMode.value = true;
  showModal.value = true;
}

function openCreateInventoryItemModal(inventory: Inventory) {
  selectedInventory.value = { ...inventory };
  selectedInventoryItem.value = {
    id: uuidv4(),
    productId: "",
    inventoryId: inventory.id,
    expectedQuantity: 0,
    actualQuantity: 0,
    sectionId: "",
    productName: "",
    sectionName: "",
  };
  isInventoryItemEditMode.value = false;
  showInventoryItemModal.value = true;
}

function openEditInventoryItemModal(inventoryItem: InventoryItem) {
  const inventory = filteredInventories.value.find(
    (i) => i.id === inventoryItem.inventoryId
  );
  if (inventory) {
    selectedInventory.value = { ...inventory };
  }
  selectedInventoryItem.value = { ...inventoryItem };
  isInventoryItemEditMode.value = true;
  showInventoryItemModal.value = true;
}

function onCancel() {
  showModal.value = false;
  selectedInventory.value = null;
  selectedInventoryItem.value = null;
}

function onCancelInventoryItem() {
  showInventoryItemModal.value = false;
  selectedInventoryItem.value = null;
}

async function onSave(payload: {
  inventory: Inventory;
  inventoryItems: InventoryItem[];
}) {
  try {
    const inventoryData = {
      id: payload.inventory.id || uuidv4(),
      number: payload.inventory.number,
      status: payload.inventory.status,
      warehouse: payload.inventory.warehouse,
      createdBy: payload.inventory.createdBy,
      comment: payload.inventory.comment,
      createdAt: payload.inventory.createdAt,
    };

    if (isEditMode.value && payload.inventory.id) {
      inventoryStore.update(payload.inventory.id, inventoryData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Инвентаризация обновлена",
        life: 3000,
      });
    } else {
      inventoryStore.create(inventoryData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Инвентаризация создана",
        life: 3000,
      });
    }

    if (payload.inventoryItems.length) {
      const inventoryItemsData = payload.inventoryItems.map((item) => ({
        id: item.id || uuidv4(),
        productId: item.productId,
        inventoryId: inventoryData.id,
        expectedQuantity: item.expectedQuantity,
        actualQuantity: item.actualQuantity,
        sectionId: item.sectionId,
        productName: item.productName,
        sectionName: item.sectionName,
      }));

      inventoryItemStore.createBulk(inventoryItemsData);
      inventoryItems.value[
        inventoryData.id
      ] = await inventoryItemStore.fetchAllByInventory(inventoryData.id);
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить инвентаризацию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedInventory.value = null;
    selectedInventoryItem.value = null;
  }
}

async function onSaveInventoryItem(inventoryItem: InventoryItem) {
  try {
    const itemData = {
      id: inventoryItem.id || uuidv4(),
      productId: inventoryItem.productId,
      inventoryId: inventoryItem.inventoryId,
      expectedQuantity: inventoryItem.expectedQuantity,
      actualQuantity: inventoryItem.actualQuantity,
      sectionId: inventoryItem.sectionId,
      productName: inventoryItem.productName,
      sectionName: inventoryItem.sectionName,
    };

    if (isInventoryItemEditMode.value && inventoryItem.id) {
      inventoryItemStore.update(inventoryItem.id, itemData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Товар инвентаризации обновлен",
        life: 3000,
      });
    } else {
      inventoryItemStore.create(itemData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Товар инвентаризации создан",
        life: 3000,
      });
    }
    if (inventoryItem.inventoryId) {
      inventoryItems.value[
        inventoryItem.inventoryId
      ] = await inventoryItemStore.fetchAllByInventory(
        inventoryItem.inventoryId
      );
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить товар инвентаризации: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showInventoryItemModal.value = false;
    selectedInventoryItem.value = null;
  }
}

async function deleteInventory(id: string) {
  try {
    inventoryStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Инвентаризация удалена",
      life: 3000,
    });
    delete inventoryItems.value[id];
    delete isLoadingInventoryItems.value[id];
    delete inventoryItemsErrors.value[id];
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить инвентаризацию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}

async function deleteInventoryItem(id: string) {
  try {
    inventoryItemStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Товар инвентаризации удален",
      life: 3000,
    });
    const inventoryId = selectedInventoryItem.value?.inventoryId;
    if (inventoryId) {
      inventoryItems.value[
        inventoryId
      ] = await inventoryItemStore.fetchAllByInventory(inventoryId);
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить товар инвентаризации: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}

async function completeInventory(id: string) {
  try {
    inventoryStore.complete(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Инвентаризация завершена",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось завершить инвентаризацию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}

const formatDate = (value: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusSeverity = (status: string): "success" | "warn" => {
  switch (status) {
    case "draft":
      return "warn";
    case "completed":
      return "success";
    default:
      return "warn";
  }
};

const clearFilter = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    number: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "status.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    "warehouse.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "createdBy.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    comment: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }],
    },
    createdAt: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
  };
};
</script>

<style scoped>
.actions-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.header-table {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inventory-items-table {
  width: 100%;
  margin-top: 20px;
}

.loader {
  margin: 20px auto;
  display: block;
}

.error {
  color: red;
  text-align: center;
  margin: 20px;
}

.no-data {
  text-align: center;
  color: #666;
  margin: 20px;
}

:deep(.p-datatable .p-datatable-tbody td),
:deep(.p-datatable .p-datatable-thead th) {
  white-space: nowrap;
}

:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}

.inventory-items-table {
  max-width: 1120px;
}

.p-icon {
  color: white !important;
}
</style>
