<template>
  <div class="orders-page">
    <h1>Страница заказов</h1>
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
          v-model:filters="filters"
          v-model:expandedRows="expandedRows"
          :value="filteredOrders"
          dataKey="id"
          row-key="id"
          paginator
          showGridlines
          :rows="10"
          filterDisplay="menu"
          :loading="isLoading"
          :globalFilterFields="[
            'number',
            'type.displayValue',
            'status.displayValue',
            'organization.displayValue',
            'warehouse.displayValue',
            'createdBy.displayValue',
            'comment',
          ]"
          class="orders-table"
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
          <template #empty> Заказы не найдены. </template>
          <template #loading>
            Загрузка заказов. Пожалуйста, подождите.
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
            field="type.displayValue"
            header="Тип"
            filterField="type.displayValue"
          >
            <template #filter="{ filterModel }">
              <Select
                v-model="filterModel.value"
                :options="orderTypes"
                placeholder="Выберите тип"
                showClear
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
                        slotProps.option === 'Черновик' ? 'draft' : 'approved'
                      )
                    "
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column
            field="organization.displayValue"
            header="Организация"
            filterField="organization.displayValue"
          >
            <template #filter="{ filterModel }">
              <InputText
                v-model="filterModel.value"
                type="text"
                placeholder="Поиск по организации"
              />
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
            field="approvedAt"
            header="Дата утверждения"
            filterField="approvedAt"
            dataType="date"
          >
            <template #body="{ data }">
              {{ formatDate(data.approvedAt) }}
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
            <div class="p-4 order-items-table">
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
                  scrollable
                  scrollHeight="400px"
                >
                  <Column
                    field="productName"
                    header="Товар"
                    style="min-width: 12rem"
                  />
                  <Column
                    field="quantity"
                    header="Количество"
                    style="min-width: 10rem"
                  />
                  <Column field="price" header="Цена" style="min-width: 10rem">
                    <template #body="{ data }">
                      {{ formatCurrency(data.price) }}
                    </template>
                  </Column>
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
      <OrderItemModal
        v-if="showOrderItemModal"
        :visible="showOrderItemModal"
        :order-item="selectedOrderItem"
        :is-edit="isOrderItemEditMode"
        @save="onSaveOrderItem"
        @cancel="onCancelOrderItem"
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
import OrderItemModal from "@/components/widgets/OrderItemModal.vue";
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
import type { Order, NewOrder, OrderItem } from "@/types/models";

const orderStore = useOrderStore();
const orderItemStore = useOrderItemStore();
const toast = useToast();

const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const showOrderItemModal = ref(false);
const isOrderItemEditMode = ref(false);
const selectedOrder = ref<Order | NewOrder | null>(null);
const selectedOrderItem = ref<OrderItem | null>(null);
const expandedRows = ref<{ [key: string]: boolean }>({});
const orderItems = ref<{ [key: string]: OrderItem[] }>({});
const isLoadingOrderItems = ref<{ [key: string]: boolean }>({});
const orderItemsErrors = ref<{ [key: string]: string }>({});

const statuses = ref(["Черновик", "Утверждён"]);
const orderTypes = ref(["Приход", "Расход"]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  number: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  "type.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  "status.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
  },
  "organization.displayValue": {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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
  approvedAt: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
});

const filteredOrders = computed<Order[]>(() => {
  return orderStore.orders ?? [];
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
    quantity: 1,
    price: 0,
    sectionId: "",
  };
  isOrderItemEditMode.value = false;
  showOrderItemModal.value = true;
}

function openEditOrderItemModal(orderItem: OrderItem) {
  const order = filteredOrders.value.find((o) => o.id === orderItem.orderId);
  if (order) {
    selectedOrder.value = { ...order };
  }
  selectedOrderItem.value = { ...orderItem };
  isOrderItemEditMode.value = true;
  showOrderItemModal.value = true;
}

function onCancel() {
  showModal.value = false;
  selectedOrder.value = null;
  selectedOrderItem.value = null;
}

function onCancelOrderItem() {
  showOrderItemModal.value = false;
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
      orderId =
        typeof createdOrder === "string" ? createdOrder : createdOrder.id;
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
        orderId: orderId,
        quantity: item.quantity,
        price: item.price,
        sectionId: item.sectionId,
        ...(item.id && { id: item.id }),
      }));

      await orderItemStore.createBulk(orderItemsData);
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

async function onSaveOrderItem(orderItem: OrderItem) {
  try {
    if (isOrderItemEditMode.value && orderItem.id) {
      await orderItemStore.update(orderItem.id, {
        productId: orderItem.productId,
        orderId: orderItem.orderId,
        quantity: orderItem.quantity,
        price: orderItem.price,
        sectionId: orderItem.sectionId,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элемент заказа обновлён",
        life: 3000,
      });
    } else {
      await orderItemStore.create({
        productId: orderItem.productId,
        orderId: orderItem.orderId,
        quantity: orderItem.quantity,
        price: orderItem.price,
        sectionId: orderItem.sectionId,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элемент заказа создан",
        life: 3000,
      });
    }
    if (orderItem.orderId) {
      await orderItemStore.fetchAllByOrder(orderItem.orderId);
      orderItems.value[orderItem.orderId] = orderItemStore.orderItems;
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
    showOrderItemModal.value = false;
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
    case "approved":
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
    "type.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    "status.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    "organization.displayValue": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
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
    approvedAt: {
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

/* Ensure table cells don't wrap content to force horizontal scrolling */
:deep(.p-datatable .p-datatable-tbody td),
:deep(.p-datatable .p-datatable-thead th) {
  white-space: nowrap;
}

/* Optional: Ensure table wrapper allows horizontal scrolling */
:deep(.p-datatable-wrapper) {
  overflow-x: auto;
}
.order-items-table {
  max-width: 1120px;
}
.p-icon {
  color: white !important;
}
</style>
