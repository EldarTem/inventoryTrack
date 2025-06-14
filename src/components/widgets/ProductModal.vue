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
      <div class="form-field">
        <label for="categoryId">Категория</label>
        <Dropdown
          id="categoryId"
          v-model="localProduct.categoryId"
          :options="categories"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите категорию"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.categoryId }"
        />
        <small v-if="errors.categoryId" class="p-error">{{
          errors.categoryId
        }}</small>
      </div>
      <div class="form-field">
        <label for="sectionId">Секция склада</label>
        <Dropdown
          id="sectionId"
          v-model="localProduct.sectionId"
          :options="sections"
          optionLabel="code"
          optionValue="id"
          placeholder="Выберите секцию"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.sectionId }"
        />
        <small v-if="errors.sectionId" class="p-error">{{
          errors.sectionId
        }}</small>
      </div>
      <div class="form-field">
        <label for="supplierId">Поставщик</label>
        <Dropdown
          id="supplierId"
          v-model="localProduct.supplierId"
          :options="suppliers"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите поставщика"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.supplierId }"
        />
        <small v-if="errors.supplierId" class="p-error">{{
          errors.supplierId
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
import { ref, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import InputNumber from "primevue/inputnumber";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { useProductCategoryStore } from "@/stores/productCategoryStore";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import type {
  Product,
  ProductCategory,
  WarehouseSection,
  Organization,
} from "@/types/models";

const props = defineProps<{
  visible: boolean;
  product: Product | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", product: Product): void;
  (e: "cancel"): void;
}>();

const productCategoryStore = useProductCategoryStore();
const warehouseStore = useWarehouseStore();
const organizationStore = useOrganizationStore();

const localProduct = ref<Product>({
  id: "",
  name: "",
  code: "",
  barcode: "",
  description: "",
  quantity: 0,
  price: 0,
  unit: "piece",
  categoryId: "",
  sectionId: "",
  supplierId: "",
});

const errors = ref({
  name: "",
  code: "",
  barcode: "",
  quantity: "",
  price: "",
  categoryId: "",
  sectionId: "",
  supplierId: "",
});

const units = ref([
  { label: "Штука", value: "piece" },
  { label: "Килограмм", value: "kilogram" },
  { label: "Литр", value: "liter" },
]);

const categories = ref<ProductCategory[]>([]);
const sections = ref<WarehouseSection[]>([]);
const suppliers = ref<Organization[]>([]);

onMounted(async () => {
  try {
    await Promise.all([
      productCategoryStore.fetchAll(),
      warehouseStore.fetchAllSections(),
      organizationStore.filter("supplier"),
    ]);
    categories.value = productCategoryStore.categories;
    sections.value = warehouseStore.sections;
    suppliers.value = organizationStore.organizations;
  } catch (error) {
    console.error("Failed to load dropdown data:", error);
  }
});

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
  errors.value = {
    name: "",
    code: "",
    barcode: "",
    quantity: "",
    price: "",
    categoryId: "",
    sectionId: "",
    supplierId: "",
  };
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
  if (!localProduct.value.categoryId) {
    errors.value.categoryId = "Категория обязательна";
    isValid = false;
  }
  if (!localProduct.value.sectionId) {
    errors.value.sectionId = "Секция склада обязательна";
    isValid = false;
  }
  if (!localProduct.value.supplierId) {
    errors.value.supplierId = "Поставщик обязателен";
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
