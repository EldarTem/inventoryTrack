<template>
  <div class="categories-page">
    <h1>Страница категорий</h1>
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <Button
          v-if="filteredCategories && filteredCategories.length"
          label="Добавить категорию"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>

      <DataTable
        v-if="filteredCategories && filteredCategories.length"
        :value="filteredCategories"
        :columns="columns"
        row-key="id"
        paginator
        :rows="10"
        class="categories-table"
      >
        <Column field="name" header="Название" />
        <Column field="description" header="Описание" />
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
                @click.stop="deleteCategory(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="no-data">
        <p>Категории отсутствуют</p>
        <Button
          label="Создать первую категорию"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
        />
      </div>
      <CategoryModal
        v-if="showModal"
        :visible="showModal"
        :category="selectedCategory"
        :isEdit="isEditMode"
        @save="saveCategory"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useProductCategoryStore } from "@/stores/productCategoryStore";
import { useToast } from "primevue/usetoast";
import CategoryModal from "@/components/widgets/CategoryModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { ProductCategory } from "@/types/models";

const categoryStore = useProductCategoryStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedCategory = ref<ProductCategory | null>(null);

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

const filteredCategories = computed(() => {
  let result = categoryStore.categories || [];
  if (filters.value.search) {
    result = result.filter((c) =>
      c.name?.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  return result;
});

const columns = [
  { field: "name", header: "Название" },
  { field: "description", header: "Описание" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await categoryStore.fetchAll();
  } catch (err) {
    error.value =
      "Не удалось загрузить категории: " +
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
  selectedCategory.value = {
    id: "",
    name: "Новая категория",
    description: "",
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(category: ProductCategory) {
  selectedCategory.value = { ...category };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedCategory.value = null;
}

async function saveCategory(category: ProductCategory) {
  try {
    if (isEditMode.value) {
      await categoryStore.update(category.id, {
        name: category.name,
        description: category.description,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Категория обновлена",
        life: 3000,
      });
    } else {
      await categoryStore.create({
        name: category.name,
        description: category.description,
      });
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Категория создана",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить категорию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedCategory.value = null;
  }
}

async function deleteCategory(id: string) {
  try {
    await categoryStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Категория удалена",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить категорию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}
</script>
