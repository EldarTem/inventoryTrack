<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать товар' : 'Добавить товар'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="inventory-item-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="product">Товар</label>
        <Dropdown
          id="product"
          v-model="localInventoryItem.productId"
          :options="products"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите товар"
          filter
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.productId }"
          @update:model-value="updateProduct"
        />
        <small v-if="errors.productId" class="p-error">{{
          errors.productId
        }}</small>
      </div>
      <div class="form-field">
        <label for="expectedQuantity">Ожидаемое количество</label>
        <InputNumber
          id="expectedQuantity"
          v-model="localInventoryItem.expectedQuantity"
          placeholder="Введите ожидаемое количество"
          class="p-inputtext-lg"
          :min="0"
          :class="{ 'p-invalid': errors.expectedQuantity }"
        />
        <small v-if="errors.expectedQuantity" class="p-error">{{
          errors.expectedQuantity
        }}</small>
      </div>
      <div class="form-field">
        <label for="actualQuantity">Фактическое количество</label>
        <InputNumber
          id="actualQuantity"
          v-model="localInventoryItem.actualQuantity"
          placeholder="Введите фактическое количество"
          class="p-inputtext-lg"
          :min="0"
          :class="{ 'p-invalid': errors.actualQuantity }"
        />
        <small v-if="errors.actualQuantity" class="p-error">{{
          errors.actualQuantity
        }}</small>
      </div>
      <div class="form-field">
        <label for="section">Секция склада</label>
        <Dropdown
          id="section"
          v-model="localInventoryItem.sectionId"
          :options="sections"
          optionLabel="code"
          optionValue="id"
          placeholder="Выберите секцию"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.sectionId }"
          @update:model-value="updateSection"
        />
        <small v-if="errors.sectionId" class="p-error">{{
          errors.sectionId
        }}</small>
      </div>
      <div class="form-field buttons">
        <Button
          label="Отмена"
          icon="pi pi-times"
          class="p-button-secondary p-button-lg"
          @click="emit('cancel')"
        />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          class="p-button-lg"
          @click="handleSave"
        />
      </div>
    </div>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { useProductStore } from "@/stores/productStore";
import { useWarehouseStore } from "@/stores/warehouseStore";
import type { InventoryItem } from "@/types/models";
import { v4 as uuidv4 } from "uuid";

const props = defineProps<{
  visible: boolean;
  inventoryItem: InventoryItem | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", inventoryItem: InventoryItem): void;
  (e: "cancel"): void;
}>();

const productStore = useProductStore();
const warehouseStore = useWarehouseStore();

const localInventoryItem = ref<InventoryItem>({
  id: "",
  productId: "",
  inventoryId: "",
  productName: "",
  expectedQuantity: 0,
  actualQuantity: 0,
  sectionId: "",
  sectionName: "",
});

const errors = ref({
  productId: "",
  expectedQuantity: "",
  actualQuantity: "",
  sectionId: "",
});

const products = computed(() => productStore.products);
const sections = computed(() => warehouseStore.sections);

onMounted(async () => {
  await Promise.all([
    productStore.fetchAll(),
    warehouseStore.fetchAllSections(),
  ]);
});

watch(
  () => props.inventoryItem,
  (newItem) => {
    if (newItem) {
      localInventoryItem.value = { ...newItem };
    }
  },
  { immediate: true }
);

function updateProduct(productId: string) {
  const product = products.value.find((p) => p.id === productId);
  if (product) {
    localInventoryItem.value.productName = product.name;
    if (product.sectionId) {
      localInventoryItem.value.sectionId = product.sectionId;
      const section = sections.value.find((s) => s.id === product.sectionId);
      localInventoryItem.value.sectionName = section?.code || "";
    }
  }
}

function updateSection(sectionId: string) {
  const section = sections.value.find((s) => s.id === sectionId);
  if (section) {
    localInventoryItem.value.sectionName = section.code;
  }
}

function validateForm() {
  errors.value = {
    productId: "",
    expectedQuantity: "",
    actualQuantity: "",
    sectionId: "",
  };
  let isValid = true;

  if (!localInventoryItem.value.productId) {
    errors.value.productId = "Товар обязателен";
    isValid = false;
  }
  if (localInventoryItem.value.expectedQuantity < 0) {
    errors.value.expectedQuantity =
      "Ожидаемое количество не может быть отрицательным";
    isValid = false;
  }
  if (localInventoryItem.value.actualQuantity < 0) {
    errors.value.actualQuantity =
      "Фактическое количество не может быть отрицательным";
    isValid = false;
  }
  if (!localInventoryItem.value.sectionId) {
    errors.value.sectionId = "Секция обязательна";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    const itemToSave: InventoryItem = {
      ...localInventoryItem.value,
      id: localInventoryItem.value.id || uuidv4(),
    };
    emit("save", itemToSave);
  }
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.form-field.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.p-error {
  color: #e53935;
  font-size: 13px;
}
</style>
