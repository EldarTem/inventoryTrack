<template>
  <Dialog
    :visible="visible"
    :header="headerText"
    modal
    @update:visible="onCancel"
    style="width: 50vw"
  >
    <form class="form-container" @submit.prevent="onSave">
      <!-- Основные поля заказа -->
      <div class="fields-section">
        <div class="field">
          <label for="number">Номер</label>
          <InputText
            id="number"
            v-model="localOrder.number"
            :class="{ 'p-invalid': errors.order.number }"
            autocomplete="off"
          />
          <small v-if="errors.order.number" class="p-error">{{
            errors.order.number
          }}</small>
        </div>
        <div class="field">
          <label for="type">Тип</label>
          <Dropdown
            id="type"
            v-model="localOrder.type.code"
            :options="orderTypes"
            optionLabel="displayValue"
            optionValue="code"
            placeholder="Выберите тип"
          />
        </div>
        <div class="field">
          <label for="status">Статус</label>
          <Dropdown
            id="status"
            v-model="localOrder.status.code"
            :options="orderStatuses"
            optionLabel="displayValue"
            optionValue="code"
            placeholder="Выберите статус"
          />
        </div>
        <div class="field">
          <label for="warehouse">Склад</label>
          <Dropdown
            id="warehouse"
            :model-value="localOrder.warehouse.id"
            :options="warehouses"
            optionLabel="displayValue"
            optionValue="id"
            placeholder="Выберите склад"
            :class="{ 'p-invalid': errors.order.warehouse }"
            @update:model-value="updateWarehouse"
          />
          <small v-if="errors.order.warehouse" class="p-error">{{
            errors.order.warehouse
          }}</small>
        </div>
        <div class="field">
          <label for="organization">Организация</label>
          <Dropdown
            id="organization"
            :model-value="localOrder.organization.id"
            :options="organizations"
            optionLabel="displayValue"
            optionValue="id"
            placeholder="Выберите организацию"
            :class="{ 'p-invalid': errors.order.organization }"
            @update:model-value="updateOrganization"
          />
          <small v-if="errors.order.organization" class="p-error">{{
            errors.order.organization
          }}</small>
        </div>
        <div class="field">
          <label for="contact">Контакт</label>
          <Dropdown
            id="contact"
            :model-value="localOrder.contact.id"
            :options="contacts"
            optionLabel="fullName"
            optionValue="id"
            placeholder="Выберите контакт"
            :class="{ 'p-invalid': errors.order.contact }"
            @update:model-value="updateContact"
          />
          <small v-if="errors.order.contact" class="p-error">{{
            errors.order.contact
          }}</small>
        </div>
        <div class="field">
          <label for="comment">Комментарий</label>
          <Textarea id="comment" v-model="localOrder.comment" rows="2" />
        </div>
      </div>

      <!-- Список товаров (inline-таблица) -->
      <div class="items-section">
        <h4>Товары заказа</h4>
        <table class="order-items-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>Кол-во</th>
              <th>Цена</th>
              <th>Секция</th>
              <th style="width: 2rem"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in localOrderItems" :key="index">
              <td>
                <Dropdown
                  v-model="item.productId"
                  :options="products"
                  optionLabel="name"
                  optionValue="id"
                  placeholder="Товар"
                  filter
                  :class="{ 'p-invalid': errors.orderItems[index]?.productId }"
                />
                <small
                  v-if="errors.orderItems[index]?.productId"
                  class="p-error"
                >
                  {{ errors.orderItems[index]?.productId }}
                </small>
              </td>
              <td>
                <InputNumber
                  v-model="item.quantity"
                  :min="1"
                  :class="{ 'p-invalid': errors.orderItems[index]?.quantity }"
                />
                <small
                  v-if="errors.orderItems[index]?.quantity"
                  class="p-error"
                >
                  {{ errors.orderItems[index]?.quantity }}
                </small>
              </td>
              <td>
                <InputNumber
                  v-model="item.price"
                  :min="0"
                  mode="currency"
                  currency="RUB"
                  :class="{ 'p-invalid': errors.orderItems[index]?.price }"
                />
                <small v-if="errors.orderItems[index]?.price" class="p-error">
                  {{ errors.orderItems[index]?.price }}
                </small>
              </td>
              <td>
                <Dropdown
                  v-model="item.sectionId"
                  :options="sections"
                  optionLabel="code"
                  optionValue="id"
                  placeholder="Секция"
                  :class="{ 'p-invalid': errors.orderItems[index]?.sectionId }"
                />
                <small
                  v-if="errors.orderItems[index]?.sectionId"
                  class="p-error"
                >
                  {{ errors.orderItems[index]?.sectionId }}
                </small>
              </td>
              <td>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  class="p-button-sm"
                  @click="removeOrderItem(index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          class="mt-2"
          label="Добавить товар"
          icon="pi pi-plus"
          @click="addOrderItem"
        />
        <div v-if="!localOrderItems.length" class="no-data">
          <p>Нет добавленных товаров</p>
        </div>
      </div>

      <!-- Кнопки сохранить/отмена -->
      <div class="footer-buttons">
        <Button label="Сохранить" icon="pi pi-check" type="submit" />
        <Button label="Отмена" icon="pi pi-times" text @click="onCancel" />
      </div>
    </form>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useProductStore } from "@/stores/productStore";
import { contactService } from "@/services/contactService";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { useToast } from "primevue/usetoast";
import type {
  Order,
  NewOrder,
  OrderItem,
  PersonContact,
  Warehouse,
  Organization,
} from "@/types/models";

const props = defineProps<{
  visible: boolean;
  order: Order | NewOrder | null;
  orderItem?: OrderItem | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (
    e: "save",
    payload: { order: Order | NewOrder; orderItems: OrderItem[] }
  ): void;
  (e: "cancel"): void;
}>();

const warehouseStore = useWarehouseStore();
const organizationStore = useOrganizationStore();
const productStore = useProductStore();
const localOrder = ref<NewOrder | Order>({
  number: "",
  type: { code: "incoming", displayValue: "Входящий" },
  status: { code: "draft", displayValue: "Черновик" },
  organization: { id: "", displayValue: "" },
  contact: { id: "", displayValue: "" },
  warehouse: { id: "", displayValue: "" },
  comment: "",
});
const localOrderItems = ref<OrderItem[]>([]);
const errors = ref({
  order: { number: "", warehouse: "", organization: "", contact: "" },
  orderItems: [] as {
    productId?: string;
    quantity?: string;
    price?: string;
    sectionId?: string;
  }[],
});
const orderTypes = [
  { code: "incoming", displayValue: "Входящий" },
  { code: "outgoing", displayValue: "Исходящий" },
];
const orderStatuses = [
  { code: "draft", displayValue: "Черновик" },
  { code: "approved", displayValue: "Утверждён" },
];
const warehouses = computed(() =>
  warehouseStore.warehouses.map((w: Warehouse) => ({
    id: w.id,
    displayValue: w.name,
  }))
);
const organizations = computed(() =>
  organizationStore.organizations.map((o: Organization) => ({
    id: o.id,
    displayValue: o.name,
  }))
);
const contacts = ref<PersonContact[]>([]);
const products = computed(() => productStore.products);
const sections = computed(() => warehouseStore.sections);

const orderId = computed(() =>
  "id" in localOrder.value ? localOrder.value.id : null
);
const headerText = computed(() =>
  props.isEdit ? "Редактировать заказ" : "Создать заказ"
);
const toast = useToast();
onMounted(async () => {
  try {
    await Promise.all([
      warehouseStore.fetchAll(),
      organizationStore.fetchAll(),
      productStore.fetchAll(),
      (async () => {
        contacts.value = await contactService.getAll();
      })(),
    ]);
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
});

watch(
  () => props.order,
  (newOrder) => {
    if (newOrder) {
      localOrder.value = { ...newOrder };
    }
  },
  { immediate: true }
);

watch(
  () => props.orderItem,
  (newOrderItem) => {
    if (newOrderItem) {
      localOrderItems.value = [{ ...newOrderItem }];
    } else {
      localOrderItems.value = [];
    }
  },
  { immediate: true }
);

function updateWarehouse(newValue: string) {
  const warehouse = warehouses.value.find(
    (w: { id: string; displayValue: string }) => w.id === newValue
  );
  localOrder.value.warehouse = {
    id: newValue,
    displayValue: warehouse?.displayValue || "",
  };
}

function updateOrganization(newValue: string) {
  const organization = organizations.value.find(
    (o: { id: string; displayValue: string }) => o.id === newValue
  );
  localOrder.value.organization = {
    id: newValue,
    displayValue: organization?.displayValue || "",
  };
}

function updateContact(newValue: string) {
  const contact = contacts.value.find((c: PersonContact) => c.id === newValue);
  localOrder.value.contact = {
    id: newValue,
    displayValue: contact?.fullName || "",
  };
}

function addOrderItem() {
  localOrderItems.value.push({
    productId: "",
    orderId: orderId.value || "",
    quantity: 1,
    price: 0,
    sectionId: "",
  });
  errors.value.orderItems.push({});
}

function removeOrderItem(index: number) {
  localOrderItems.value.splice(index, 1);
  errors.value.orderItems.splice(index, 1);
}

function validateOrder(): boolean {
  errors.value.order = {
    number: "",
    warehouse: "",
    organization: "",
    contact: "",
  };
  let isValid = true;
  if (!localOrder.value.number) {
    errors.value.order.number = "Номер обязателен";
    isValid = false;
  }
  if (!localOrder.value.warehouse.id) {
    errors.value.order.warehouse = "Склад обязателен";
    isValid = false;
  }
  if (!localOrder.value.organization.id) {
    errors.value.order.organization = "Организация обязательна";
    isValid = false;
  }
  if (!localOrder.value.contact.id) {
    errors.value.order.contact = "Контакт обязателен";
    isValid = false;
  }
  return isValid;
}

function validateOrderItems(): boolean {
  errors.value.orderItems = localOrderItems.value.map(() => ({}));
  let isValid = true;
  localOrderItems.value.forEach((item, index) => {
    if (!item.productId) {
      errors.value.orderItems[index].productId = "Товар обязателен";
      isValid = false;
    }
    if (item.quantity <= 0) {
      errors.value.orderItems[index].quantity =
        "Количество должно быть больше 0";
      isValid = false;
    }
    if (item.price < 0) {
      errors.value.orderItems[index].price = "Цена не может быть меньше 0";
      isValid = false;
    }
    if (!item.sectionId) {
      errors.value.orderItems[index].sectionId = "Секция обязательна";
      isValid = false;
    }
  });
  return isValid;
}

function onSave() {
  const isOrderValid = validateOrder();
  const isOrderItemsValid = localOrderItems.value.length
    ? validateOrderItems()
    : true;
  if (isOrderValid && isOrderItemsValid) {
    emit("save", {
      order: localOrder.value,
      orderItems: localOrderItems.value,
    });
  } else {
    toast.add({
      severity: "error",
      summary: "Исправьте ошибки формы",
      life: 3000,
    });
  }
}

function onCancel() {
  emit("cancel");
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.fields-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 36px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.items-section {
  margin-top: 14px;
}
.order-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
}
.order-items-table th,
.order-items-table td {
  border: 1px solid #eee;
  padding: 8px;
  text-align: left;
}
.order-items-table th {
  background: #f7f7f7;
}
.p-error {
  color: #e53935;
  font-size: 13px;
}
.no-data {
  text-align: center;
  color: #666;
  margin: 16px;
}
.footer-buttons {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
