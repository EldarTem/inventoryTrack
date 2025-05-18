<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать секцию' : 'Создать секцию'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="warehouse-section-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="code">Код</label>
        <InputText
          id="code"
          v-model="localSection.code"
          placeholder="Введите код"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.code }"
        />
        <small v-if="errors.code" class="p-error">{{ errors.code }}</small>
      </div>
      <div class="form-field">
        <label for="warehouse">Склад</label>
        <Dropdown
          id="warehouse"
          :model-value="localSection.warehouse.id"
          :options="warehouses"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите склад"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.warehouse }"
          :disabled="isEdit"
          @update:model-value="
            (newValue) =>
              (localSection.warehouse = {
                id: newValue,
                displayValue:
                  warehouses.find((w) => w.id === newValue)?.name || '',
              })
          "
        />
        <small v-if="errors.warehouse" class="p-error">{{
          errors.warehouse
        }}</small>
      </div>
      <div class="form-field">
        <label for="description">Описание</label>
        <Textarea
          id="description"
          v-model="localSection.description"
          placeholder="Введите описание"
          rows="4"
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
import { ref, watch, computed } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { useWarehouseStore } from "@/stores/warehouseStore";
import type { WarehouseSection } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  section: WarehouseSection | null;
  isEdit: boolean;
  warehouseId: string | null;
}>();

const emit = defineEmits<{
  (e: "save", section: WarehouseSection): void;
  (e: "cancel"): void;
}>();

const warehouseStore = useWarehouseStore();

const localSection = ref<WarehouseSection>({
  id: "",
  code: "",
  description: "",
  warehouse: { id: props.warehouseId || "", displayValue: "" },
});

const errors = ref({
  code: "",
  warehouse: "",
});

const warehouses = computed(() => warehouseStore.warehouses || []);

watch(
  () => props.section,
  (newSection) => {
    if (newSection) {
      localSection.value = {
        ...newSection,
        warehouse: { ...newSection.warehouse },
      };
    }
  },
  { immediate: true }
);

watch(
  () => props.warehouseId,
  (newWarehouseId) => {
    if (newWarehouseId && !props.isEdit) {
      localSection.value.warehouse = {
        id: newWarehouseId,
        displayValue:
          warehouses.value.find((w) => w.id === newWarehouseId)?.name || "",
      };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = { code: "", warehouse: "" };
  let isValid = true;

  if (!localSection.value.code) {
    errors.value.code = "Код обязателен";
    isValid = false;
  }
  if (!localSection.value.warehouse.id) {
    errors.value.warehouse = "Склад обязателен";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localSection.value });
  }
}
</script>

