<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать категорию' : 'Создать категорию'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="category-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Название</label>
        <InputText
          id="name"
          v-model="localCategory.name"
          placeholder="Введите название"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="form-field">
        <label for="description">Описание</label>
        <Textarea
          id="description"
          v-model="localCategory.description"
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
import { ref, watch } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Button from "primevue/button";
import type { ProductCategory } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  category: ProductCategory | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", category: ProductCategory): void;
  (e: "cancel"): void;
}>();

const localCategory = ref<ProductCategory>({
  id: "",
  name: "",
  description: "",
});

const errors = ref({
  name: "",
});

watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      localCategory.value = { ...newCategory };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = { name: "" };
  let isValid = true;

  if (!localCategory.value.name) {
    errors.value.name = "Название обязательно";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localCategory.value });
  }
}
</script>
