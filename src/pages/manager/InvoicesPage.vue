<!-- components/OrdersPage.vue -->
<template>
  <div class="orders-page">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <TabView v-model:activeIndex="activeIndex">
        <TabPanel header="Заказы" value="orders">
          <div class="actions-container"></div>

          <DataTable
            v-if="filteredOrders && filteredOrders.length"
            :value="filteredOrders"
            :columns="columns"
            row-key="id"
            paginator
            :rows="10"
            class="orders-table"
          >
            <Column field="number" header="Номер" />
            <Column field="type.displayValue" header="Тип" />
            <Column field="status.displayValue" header="Статус" />
            <Column field="organization.displayValue" header="Организация" />
            <Column field="warehouse.displayValue" header="Склад" />
            <Column header="Действия">
              <template #body="{ data }">
                <div class="actions-container">
                  <Button
                    icon="pi pi-check"
                    severity="success"
                    class="p-button-sm"
                    @click.stop="approveOrder(data.id)"
                    :disabled="data.status.code === 'approved'"
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
                    @click.stop="deleteOrder(data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-else class="no-data">
            <p>Заказы отсутствуют</p>
            <Button
              label="Создать первый заказ"
              icon="pi pi-plus"
              class="p-button-lg"
            />
          </div>
        </TabPanel>
        <TabPanel header="Элементы заказа" value="order-items">
          <OrderItemsTab />
        </TabPanel>
      </TabView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { useToast } from "primevue/usetoast";
import OrderItemsTab from "@/components/OrderItemsTab.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { Order } from "@/types/models";

const orderStore = useOrderStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref<Order | null>(null);
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

const filteredOrders = computed(() => {
  let result = orderStore.orders || [];
  if (filters.value.search) {
    result = result.filter((o) =>
      o.number?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  if (filters.value.status) {
    result = result.filter((o) => o.status.code === filters.value.status);
  }
  return result;
});

const columns = [
  { field: "number", header: "Номер" },
  { field: "type.displayValue", header: "Тип" },
  { field: "status.displayValue", header: "Статус" },
  { field: "organization.displayValue", header: "Организация" },
  { field: "warehouse.displayValue", header: "Склад" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await orderStore.fetchAll();
  } catch (err) {
    error.value =
      "Не удалось загрузить заказы: " +
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

function openEditModal(order: Order) {
  selectedOrder.value = { ...order };
  isEditMode.value = true;
  showModal.value = true;
}

async function deleteOrder(id: string) {
  try {
    await orderStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Заказ удалён",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить заказ: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}

async function approveOrder(id: string) {
  try {
    await orderStore.approve(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Заказ утверждён",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось утвердить заказ: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}
</script>

<style scoped>
.orders-page {
  padding: 20px;
}
.actions-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.filter-panel {
  margin-bottom: 20px;
}
.orders-table {
  width: 100%;
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
</style>
