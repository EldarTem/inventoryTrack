<!-- components/OrderItemsTab.vue -->
<template>
  <div class="order-items-tab">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <Dropdown
          v-model="selectedOrder"
          :options="orders"
          optionLabel="number"
          optionValue="id"
          placeholder="Выберите заказ"
          class="order-selector"
          @change="fetchOrderItems"
        />
        <Button
          v-if="selectedOrder"
          label="Добавить элемент"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <DataTable
        v-if="filteredOrderItems && filteredOrderItems.length"
        :value="filteredOrderItems"
        :columns="columns"
        row-key="id"
        paginator
        :rows="10"
        class="order-items-table"
      >
        <Column field="productName" header="Товар" />
        <Column field="quantity" header="Количество" />
        <Column field="price" header="Цена" />
        <Column field="sectionName" header="Секция" />
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
                @click.stop="deleteOrderItem(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else-if="selectedOrder" class="no-data">
        <p>Элементы заказа отсутствуют</p>
        <Button
          label="Создать первый элемент"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <div v-else class="no-data">
        <p>Выберите заказ для просмотра элементов</p>
      </div>
      <OrderItemModal
        v-if="showModal"
        :visible="showModal"
        :orderItem="selectedOrderItem"
        :isEdit="isEditMode"
        @save="saveOrderItem"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { useOrderItemStore } from "@/stores/orderItemStore";
import { useToast } from "primevue/usetoast";
import OrderItemModal from "@/components/widgets/OrderItemModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import type {  OrderItem } from "@/types/models";

const orderStore = useOrderStore();
const orderItemStore = useOrderItemStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref<string | null>(null);
const selectedOrderItem = ref<OrderItem | null>(null);

const orders = computed(() => orderStore.orders);
const filteredOrderItems = computed(() => orderItemStore.orderItems);

const columns = [
  { field: "productName", header: "Товар" },
  { field: "quantity", header: "Количество" },
  { field: "price", header: "Цена" },
  { field: "sectionName", header: "Секция" },
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

async function fetchOrderItems() {
  if (!selectedOrder.value) return;
  isLoading.value = true;
  error.value = null;
  try {
    await orderItemStore.fetchAllByOrder(selectedOrder.value);
  } catch (err) {
    error.value =
      "Не удалось загрузить элементы заказа: " +
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
}

function openCreateModal() {
  if (!selectedOrder.value) return;
  selectedOrderItem.value = {
    productId: "",
    orderId: selectedOrder.value,
    quantity: 0,
    price: 0,
    sectionId: "",
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(orderItem: OrderItem) {
  selectedOrderItem.value = { ...orderItem };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedOrderItem.value = null;
}

async function saveOrderItem(orderItem: OrderItem) {
  try {
    const orderItemData = {
      productId: orderItem.productId,
      orderId: orderItem.orderId,
      quantity: orderItem.quantity,
      price: orderItem.price,
      sectionId: orderItem.sectionId,
    };
    if (isEditMode.value && orderItem.id) {
      await orderItemStore.update(orderItem.id, orderItemData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элемент заказа обновлён",
        life: 3000,
      });
    } else {
      await orderItemStore.create(orderItemData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элемент заказа создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить элемент заказа: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedOrderItem.value = null;
  }
}

async function deleteOrderItem(id: string) {
  try {
    await orderItemStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Элемент заказа удалён",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить элемент заказа: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}
</script>

<style scoped>
.order-items-tab {
  padding: 20px;
}
.actions-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.order-selector {
  width: 200px;
}
.order-items-table {
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
