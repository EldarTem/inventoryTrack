<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать товар' : 'Создать товар'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="product-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Название</label>
        <InputText
          id="name"
          v-model="localProduct.name"
          placeholder="Введите название"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="form-field">
        <label for="code">Код</label>
        <InputText
          id="code"
          v-model="localProduct.code"
          placeholder="Введите код"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.code }"
        />
        <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
      </div>
      <div class="form-field">
        <label for="barcode">Штрихкод</label>
        <InputText
          id="barcode"
          v-model="localProduct.barcode"
          placeholder="Введите штрихкод"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.barcode }"
        />
        <small v-if="errors.barcode" class="p-error">{{
          errors.barcode
        }}</small>
      </div>
      <div class="form-field">
        <label for="description">Описание</label>
        <Textarea
          id="description"
          v-model="localProduct.description"
          placeholder="Введите описание"
          rows="4"
          class="p-inputtext-lg"
        />
      </div>
      <div class="form-field">
        <label for="quantity">Количество</label>
        <InputNumber
          id="quantity"
          v-model="localProduct.quantity"
          placeholder="Введите количество"
          class="p-inputtext-lg"
          :min="0"
          :class="{ 'p-invalid': errors.quantity }"
        />
        <small v-if="errors.quantity" class="p-error">{{
          errors.quantity
        }}</small>
      </div>
      <div class="form-field">
        <label for="price">Цена</label>
        <InputNumber
          id="price"
          v-model="localProduct.price"
          placeholder="Введите цену"
          class="p-inputtext-lg"
          :min="0"
          :class="{ 'p-invalid': errors.price }"
        />
        <small v-if="errors.price" class="p-error">{{ errors.price }}</small>
      </div>
      <div class="form-field">
        <label for="unit">Единица измерения</label>
        <Dropdown
          id="unit"
          v-model="localProduct.unit"
          :options="units"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите единицу"
          class="p-inputtext-lg"
        />
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
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import type { Product } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  product: Product | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", product: Product): void;
  (e: "cancel"): void;
}>();

const localProduct = ref<Product>({
  id: "",
  name: "",
  code: "",
  barcode: "",
  description: "",
  quantity: 0,
  price: 0,
  unit: 0,
  categoryId: "a11e7f84-0482-4dfc-8f8c-13b7cf41cebe",
  sectionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  supplierId: "a1b2c3d4-1111-2222-3333-444455556666",
});

const errors = ref({
  name: "",
  code: "",
  barcode: "",
  quantity: "",
  price: "",
});

const units = ref([
  { label: "Штука", value: 0 },
  { label: "Килограмм", value: 1 },
  { label: "Литр", value: 2 },
]);

watch(
  () => props.product,
  (newProduct) => {
    if (newProduct) {
      localProduct.value = { ...newProduct };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = { name: "", code: "", barcode: "", quantity: "", price: "" };
  let isValid = true;

  if (!localProduct.value.name) {
    errors.value.name = "Название обязательно";
    isValid = false;
  }
  if (!localProduct.value.code) {
    errors.value.code = "Код обязателен";
    isValid = false;
  }
  if (!localProduct.value.barcode) {
    errors.value.barcode = "Штрихкод обязателен";
    isValid = false;
  }
  if (localProduct.value.quantity < 0) {
    errors.value.quantity = "Количество не может быть отрицательным";
    isValid = false;
  }
  if (localProduct.value.price < 0) {
    errors.value.price = "Цена не может быть отрицательной";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localProduct.value });
  }
}
</script>
