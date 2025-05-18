<template>
  <div class="filter-panel">
    <div class="filter-field">
      <label for="search">Поиск</label>
      <InputText
        id="search"
        v-model="localFilters.search"
        placeholder="Введите запрос"
        class="p-inputtext-lg"
      />
    </div>
    <div class="filter-field">
      <label for="status">Статус</label>
      <Dropdown
        id="status"
        v-model="localFilters.status"
        :options="statuses"
        option-label="label"
        option-value="value"
        placeholder="Выберите статус"
        class="p-inputtext-lg"
        :show-clear="true"
      />
    </div>
    <div class="filter-field">
      <label for="date">Дата</label>
      <Calendar
        id="date"
        v-model="localFilters.date"
        date-format="dd.mm.yy"
        placeholder="Выберите дату"
        class="p-inputtext-lg"
        :show-clear="true"
      />
    </div>
    <div class="filter-actions">
      <Button label="Применить" icon="pi pi-check" @click="apply" />
      <Button
        label="Сбросить"
        icon="pi pi-times"
        severity="secondary"
        @click="reset"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";

defineProps<{
  statuses: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  (
    e: "apply",
    filters: { search: string; status: string | undefined; date: Date | null }
  ): void;
  (e: "reset"): void;
}>();

const localFilters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});

function apply() {
  emit("apply", { ...localFilters.value });
}

function reset() {
  localFilters.value = { search: "", status: undefined, date: null };
  emit("reset");
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 1 200px;
}

.filter-field label {
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.filter-field :deep(.p-inputtext),
.filter-field :deep(.p-dropdown),
.filter-field :deep(.p-calendar .p-inputtext) {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.filter-actions :deep(.p-button) {
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
}
</style>
