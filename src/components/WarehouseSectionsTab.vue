<template>
  <div class="warehouse-sections-tab">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="actions-container">
        <div class="filter-field">
          <label for="warehouse-filter">Склад</label>
          <Dropdown
            id="warehouse-filter"
            v-model="selectedWarehouseId"
            :options="warehouses"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите склад"
            class="p-inputtext-lg"
          />
        </div>
        <Button
          label="Добавить секцию"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
          :disabled="!selectedWarehouseId"
        />
      </div>
      <DataTable
        v-if="filteredSections && filteredSections.length"
        :value="filteredSections"
        row-key="id"
        paginator
        :rows="10"
        class="sections-table"
      >
        <Column field="code" header="Код" />
        <Column field="description" header="Описание" />
        <Column field="warehouse.displayValue" header="Склад" />
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
                @click.stop="deleteSection(data.id)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
      <div v-else class="no-data">
        <p>Секции отсутствуют</p>
        <Button
          label="Создать первую секцию"
          icon="pi pi-plus"
          class="p-button-lg"
          @click="openCreateModal"
          :disabled="!selectedWarehouseId"
        />
      </div>
      <WarehouseSectionModal
        v-if="showModal"
        :visible="showModal"
        :section="selectedSection"
        :isEdit="isEditMode"
        :warehouseId="selectedWarehouseId"
        @save="saveSection"
        @cancel="closeModal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useToast } from "primevue/usetoast";
import WarehouseSectionModal from "@/components/widgets/WarehouseSectionModal.vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import ProgressSpinner from "primevue/progressspinner";
import type { WarehouseSection } from "@/types/models";

const warehouseStore = useWarehouseStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedSection = ref<WarehouseSection | null>(null);
const selectedWarehouseId = ref<string | null>(null);

const warehouses = computed(() => warehouseStore.warehouses || []);

const filteredSections = computed(() => {
  if (!selectedWarehouseId.value) return [];
  return warehouseStore.sections.filter(
    (s) => s.warehouse.id === selectedWarehouseId.value
  );
});

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log("Fetching warehouse sections...");
    await Promise.all([
      warehouseStore.fetchAll(),
      warehouseStore.fetchAllSections(),
    ]);
    if (warehouses.value.length > 0) {
      selectedWarehouseId.value = warehouses.value[0].id;
    }
    console.log("Sections fetched:", warehouseStore.sections);
  } catch (err) {
    error.value =
      "Не удалось загрузить секции: " +
      (err instanceof Error ? err.message : "Неизвестная ошибка");
    console.error("Fetch error:", error.value);
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
  if (!selectedWarehouseId.value) return;
  selectedSection.value = {
    id: "",
    code: "",
    description: "",
    warehouse: {
      id: selectedWarehouseId.value,
      displayValue:
        warehouses.value.find((w) => w.id === selectedWarehouseId.value)
          ?.name || "",
    },
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(section: WarehouseSection) {
  selectedSection.value = { ...section };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedSection.value = null;
}

async function saveSection(section: WarehouseSection) {
  try {
    const sectionData = {
      code: section.code,
      warehouseId: section.warehouse.id,
      description: section.description,
    };
    if (isEditMode.value) {
      await warehouseStore.updateSection(section.id, sectionData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Секция обновлена",
        life: 3000,
      });
    } else {
      await warehouseStore.createSection(sectionData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Секция создана",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить секцию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedSection.value = null;
  }
}

async function deleteSection(id: string) {
  try {
    await warehouseStore.removeSection(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Секция удалена",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить секцию: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}
</script>


