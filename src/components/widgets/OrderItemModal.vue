<!-- components/widgets/OrderItemModal.vue -->
<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать элемент заказа' : 'Создать элемент заказа'"
    modal
    @update:visible="onCancel"
  >
    <div class="form-container">
      <div class="field">
        <label for="product">Товар</label>
        <Dropdown
          id="product"
          v-model="localOrderItem.productId"
          :options="products"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите товар"
          :class="{ 'p-invalid': errors.product }"
        />
        <small v-if="errors.product" class="p-error">{{
          errors.product
        }}</small>
      </div>
      <div class="field">
        <label for="quantity">Количество</label>
        <InputNumber
          id="quantity"
          v-model="localOrderItem.quantity"
          :min="0"
          :class="{ 'p-invalid': errors.quantity }"
        />
        <small v-if="errors.quantity" class="p-error">{{
          errors.quantity
        }}</small>
      </div>
      <div class="field">
        <label for="price">Цена</label>
        <InputNumber
          id="price"
          v-model="localOrderItem.price"
          :min="0"
          mode="currency"
          currency="RUB"
          :class="{ 'p-invalid': errors.price }"
        />
        <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
      </div>
      <div class="field">
        <label for="section">Секция</label>
        <Dropdown
          id="section"
          v-model="localOrderItem.sectionId"
          :options="sections"
          optionLabel="code"
          optionValue="id"
          placeholder="Выберите секцию"
          :class="{ 'p-invalid': errors.section }"
        />
        <small v-if="errors.section" class="p-error">{{
          errors.section
        }}</small>
      </div>
    </div>
    <template #footer>
      <Button label="Отмена" icon="pi pi-times" text @click="onCancel" />
      <Button label="Сохранить" icon="pi pi-check" @click="onSave" />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useWarehouseStore } from "@/stores/warehouseStore";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import type { OrderItem } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  orderItem: OrderItem | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", orderItem: OrderItem): void;
  (e: "cancel"): void;
}>();

const productStore = useProductStore();
const warehouseStore = useWarehouseStore();
const localOrderItem = ref<OrderItem>({
  productId: "",
  orderId: "",
  quantity: 0,
  price: 0,
  sectionId: "",
});

const errors = ref({
  product: "",
  quantity: "",
  price: "",
  section: "",
});

const products = computed(() => productStore.products);
const sections = computed(() => warehouseStore.sections);

watch(
  () => props.orderItem,
  (newOrderItem) => {
    if (newOrderItem) {
      localOrderItem.value = { ...newOrderItem };
    }
  },
  { immediate: true }
);

function validate(): boolean {
  errors.value = {
    product: "",
    quantity: "",
    price: "",
    section: "",
  };
  let isValid = true;
  if (!localOrderItem.value.productId) {
    errors.value.product = "Товар обязателен";
    isValid = false;
  }
  if (localOrderItem.value.quantity <= 0) {
    errors.value.quantity = "Количество должно быть больше 0";
    isValid = false;
  }
  if (localOrderItem.value.price <= 0) {
    errors.value.price = "Цена должна быть больше 0";
    isValid = false;
  }
  if (!localOrderItem.value.sectionId) {
    errors.value.section = "Секция обязательна";
    isValid = false;
  }
  return isValid;
}

function onSave() {
  if (validate()) {
    emit("save", localOrderItem.value);
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
  gap: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.p-error {
  color: red;
}
</style>
