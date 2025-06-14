<!-- pages/admin/DashboardPage.vue -->
<template>
  <div class="orders-page">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="filteredOrders && filteredOrders.length">
        <div class="actions-container">
          <Button
            label="Добавить заказ"
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
          v-model:expandedRows="expandedRows"
          :value="filteredOrders"
          dataKey="id"
          row-key="id"
          paginator
          :rows="10"
          class="orders-table"
          @rowExpand="onRowExpand"
        >
          <Column expander style="width: 5rem" />
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
          <template #expansion="{ data }">
            <div class="p-4">
              <h5>Товары для заказа {{ data.number }}</h5>
              <ProgressSpinner
                v-if="isLoadingOrderItems[data.id]"
                class="loader"
              />
              <div v-else-if="orderItemsErrors[data.id]" class="error">
                {{ orderItemsErrors[data.id] }}
              </div>
              <div v-else>
                <div class="actions-container">
                  <Button
                    label="Добавить элемент"
                    icon="pi pi-plus"
                    class="p-button-lg"
                    @click="openCreateOrderItemModal(data)"
                  />
                </div>
                <DataTable
                  v-if="orderItems[data.id] && orderItems[data.id].length"
                  :value="orderItems[data.id]"
                  class="order-items-table"
                >
                  <Column field="productName" header="Товар" />
                  <Column field="quantity" header="Количество" />
                  <Column field="price" header="Цена">
                    <template #body="{ data }">
                      {{ formatCurrency(data.price) }}
                    </template>
                  </Column>
                  <Column field="sectionName" header="Секция" />
                  <Column header="Действия">
                    <template #body="{ data: item }">
                      <div class="actions-container">
                        <Button
                          icon="pi pi-pencil"
                          severity="warning"
                          class="p-button-sm"
                          @click.stop="openEditOrderItemModal(item)"
                        />
                        <Button
                          icon="pi pi-trash"
                          severity="danger"
                          class="p-button-sm"
                          @click.stop="deleteOrderItem(item.id)"
                        />
                      </div>
                    </template>
                  </Column>
                </DataTable>
                <div v-else class="no-data">
                  <p>Элементы заказа отсутствуют</p>
                  <Button
                    label="Создать первый элемент"
                    icon="pi pi-plus"
                    class="p-button-lg"
                    @click="openCreateOrderItemModal(data)"
                  />
                </div>
              </div>
            </div>
          </template>
        </DataTable>
      </div>
      <div v-else class="no-data">
        <p>Заказы отсутствуют</p>
        <Button
          label="Создать первый заказ"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <OrderManagementModal
        v-if="showModal"
        :visible="showModal"
        :order="selectedOrder"
        :order-item="selectedOrderItem"
        :is-edit="isEditMode"
        @save="onSave"
        @cancel="onCancel"
      />
      <Toast />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useOrderStore } from "@/stores/orderStore";
import { useOrderItemStore } from "@/stores/orderItemStore";
import { useToast } from "primevue/usetoast";
import OrderManagementModal from "@/components/widgets/OrderManagementModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import Toast from "primevue/toast";
import type { Order, NewOrder, OrderItem } from "@/types/models";

const orderStore = useOrderStore();
const orderItemStore = useOrderItemStore();
const toast = useToast();

const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedOrder = ref<Order | NewOrder | null>(null);
const selectedOrderItem = ref<OrderItem | null>(null);
const expandedRows = ref<{ [key: string]: boolean }>({});
const orderItems = ref<{ [key: string]: OrderItem[] }>({});
const isLoadingOrderItems = ref<{ [key: string]: boolean }>({});
const orderItemsErrors = ref<{ [key: string]: string }>({});

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

const filteredOrders = computed<Order[]>(() => {
  let result = orderStore.orders ?? [];
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

async function onRowExpand(event: { data: Order }) {
  const orderId = event.data.id;
  if (!orderItems.value[orderId]) {
    isLoadingOrderItems.value[orderId] = true;
    orderItemsErrors.value[orderId] = "";
    try {
      await orderItemStore.fetchAllByOrder(orderId);
      orderItems.value[orderId] = orderItemStore.orderItems;
      toast.add({
        severity: "info",
        summary: "Товары загружены",
        detail: `Товары для заказа ${event.data.number}`,
        life: 3000,
      });
    } catch (err) {
      orderItemsErrors.value[orderId] =
        "Не удалось загрузить элементы заказа: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка");
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: orderItemsErrors.value[orderId],
        life: 3000,
      });
    } finally {
      isLoadingOrderItems.value[orderId] = false;
    }
  }
}

function expandAll() {
  expandedRows.value = filteredOrders.value.reduce(
    (acc, o) => ({ ...acc, [o.id]: true }),
    {}
  );
  filteredOrders.value.forEach((order) => onRowExpand({ data: order }));
}

function collapseAll() {
  expandedRows.value = {};
}

function openCreateModal() {
  selectedOrder.value = {
    number: "",
    type: { code: "incoming", displayValue: "Входящий" },
    status: { code: "draft", displayValue: "Черновик" },
    organization: { id: "", displayValue: "" },
    contact: { id: "", displayValue: "" },
    warehouse: { id: "", displayValue: "" },
    comment: "",
  };
  selectedOrderItem.value = null;
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(order: Order) {
  selectedOrder.value = { ...order };
  selectedOrderItem.value = null;
  isEditMode.value = true;
  showModal.value = true;
}

function openCreateOrderItemModal(order: Order) {
  selectedOrder.value = { ...order };
  selectedOrderItem.value = {
    productId: "",
    orderId: order.id,
    quantity: 0,
    price: 0,
    sectionId: "",
  };
  isEditMode.value = true;
  showModal.value = true;
}

function openEditOrderItemModal(orderItem: OrderItem) {
  const order = filteredOrders.value.find((o) => o.id === orderItem.orderId);
  if (order) {
    selectedOrder.value = { ...order };
  }
  selectedOrderItem.value = { ...orderItem };
  isEditMode.value = true;
  showModal.value = true;
}

function onCancel() {
  showModal.value = false;
  selectedOrder.value = null;
  selectedOrderItem.value = null;
}

async function onSave(payload: {
  order: Order | NewOrder;
  orderItems: OrderItem[];
}) {
  try {
    const orderData = {
      number: payload.order.number,
      type: payload.order.type.code,
      status: payload.order.status.code,
      comment: payload.order.comment,
      warehouseId: payload.order.warehouse.id,
      organizationId: payload.order.organization.id,
      contactId: payload.order.contact.id,
    };
    let orderId: string;
    if (isEditMode.value && "id" in payload.order && payload.order.id) {
      await orderStore.update(payload.order.id, orderData);
      orderId = payload.order.id;
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Заказ обновлён",
        life: 3000,
      });
    } else {
      const createdOrder = await orderStore.create(orderData);
      orderId = createdOrder.id;
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Заказ создан",
        life: 3000,
      });
    }
    if (payload.orderItems.length) {
      const orderItemsData = payload.orderItems.map((item) => ({
        productId: item.productId,
        orderId: orderId || item.orderId,
        quantity: item.quantity,
        price: item.price,
        sectionId: item.sectionId,
        ...(item.id && { id: item.id }),
      }));
      await orderItemStore.createBulk(orderItemsData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элементы заказа сохранены",
        life: 3000,
      });
      if (!orderId) {
        throw new Error("Идентификатор заказа не определен");
      }
      await orderItemStore.fetchAllByOrder(orderId);
      orderItems.value[orderId] = orderItemStore.orderItems;
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить данные: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedOrder.value = null;
    selectedOrderItem.value = null;
  }
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
    delete orderItems.value[id];
    delete isLoadingOrderItems.value[id];
    delete orderItemsErrors.value[id];
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

async function deleteOrderItem(id: string) {
  try {
    await orderItemStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Элемент заказа удалён",
      life: 3000,
    });
    const orderId = selectedOrderItem.value?.orderId;
    if (orderId) {
      await orderItemStore.fetchAllByOrder(orderId);
      orderItems.value[orderId] = orderItemStore.orderItems;
    }
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

const formatCurrency = (value: number) => {
  return value.toLocaleString("ru-RU", { style: "currency", currency: "RUB" });
};
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
.orders-table {
  width: 100%;
}
.order-items-table {
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
</style>
