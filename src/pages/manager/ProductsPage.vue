<template>
  <div class="products-page">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <Button
          v-if="filteredProducts && filteredProducts.length"
          label="Добавить товар"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <FilterPanel
        v-if="filteredProducts && filteredProducts.length"
        :statuses="statuses"
        @apply="applyFilters"
        @reset="resetFilters"
        class="filter-panel"
      />
      <DataTable
        v-if="filteredProducts && filteredProducts.length"
        :value="filteredProducts"
        :columns="columns"
        row-key="id"
        paginator
        :rows="10"
        class="products-table"
      >
        <Column field="name" header="Название" />
        <Column field="price" header="Цена" />
        <Column header="Ед.изм.">
          <template #body="{ data }">
            {{ data.unit?.displayValue || "—" }}
          </template>
        </Column>
        <Column field="quantity" header="Остаток" />
        <Column field="barcode" header="Штрихкод" />
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
                @click.stop="deleteProduct(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="no-data">
        <p>Товары отсутствуют</p>
        <Button
          label="Создать первый товар"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <ProductModal
        v-if="showModal"
        :visible="showModal"
        :product="selectedProduct"
        :isEdit="isEditMode"
        @save="saveProduct"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useToast } from "primevue/usetoast";
import ProductModal from "@/components/widgets/ProductModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { Product } from "@/types/models";

const productStore = useProductStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedProduct = ref<Product | null>(null);

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

const statuses = ref([]);

const filteredProducts = computed(() => {
  const products = productStore.products || [];
  if (filters.value.search) {
    return products.filter((p) =>
      p.name?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  return products;
});

const columns = [
  { field: "name", header: "Название" },
  { field: "price", header: "Цена" },
  { field: "unit", header: "Ед.изм." },
  { field: "quantity", header: "Остаток" },
  { field: "barcode", header: "Штрихкод" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await productStore.fetchAll();
  } catch (err) {
    error.value =
      "Не удалось загрузить товары: " +
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

function openCreateModal() {
  selectedProduct.value = {
    id: "",
    name: "Новый товар",
    code: "CODE_" + Date.now(),
    barcode: "BARCODE_" + Date.now(),
    description: "",
    quantity: 0,
    price: 0,
    unit: "",
    categoryId: "a11e7f84-0482-4dfc-8f8c-13b7cf41cebe",
    sectionId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    supplierId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(product: Product) {
  selectedProduct.value = { ...product };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedProduct.value = null;
}

async function saveProduct(product: Product) {
  try {
    if (isEditMode.value) {
      await productStore.update(product.id, {
        ...product,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Товар обновлен",
        life: 3000,
      });
    } else {
      await productStore.create({
        ...product,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Товар создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить товар: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedProduct.value = null;
  }
}

async function deleteProduct(id: string) {
  try {
    await productStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Товар удален",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить товар: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}

function applyFilters(newFilters: typeof filters.value) {
  filters.value = newFilters;
}

function resetFilters() {
  filters.value = { search: "", status: undefined, date: null };
}
</script>
