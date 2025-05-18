<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать склад' : 'Создать склад'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="warehouse-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="name">Название</label>
        <InputText
          id="name"
          v-model="localWarehouse.name"
          placeholder="Введите название"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>
      <div class="form-field">
        <label for="address">Адрес</label>
        <InputText
          id="address"
          v-model="localWarehouse.address"
          placeholder="Введите адрес"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.address }"
        />
        <small v-if="errors.address" class="p-error">{{
          errors.address
        }}</small>
      </div>
      <div class="form-field">
        <label for="owner">Владелец</label>
        <Dropdown
          id="owner"
          :model-value="localWarehouse.owner.id"
          :options="contacts"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Выберите владельца"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.owner }"
          @update:model-value="
            (newValue) =>
              (localWarehouse.owner = {
                id: newValue,
                displayValue:
                  contacts.find((o) => o.id === newValue)?.fullName || '',
              })
          "
        />
        <small v-if="errors.owner" class="p-error">{{ errors.owner }}</small>
      </div>
      <div class="form-field">
        <label for="description">Описание</label>
        <Textarea
          id="description"
          v-model="localWarehouse.description"
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
import { ref, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { contactService } from "@/services/contactService";
import type { Warehouse, PersonContact } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  warehouse: Warehouse | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", warehouse: Warehouse): void;
  (e: "cancel"): void;
}>();

const localWarehouse = ref<Warehouse>({
  id: "",
  name: "",
  address: "",
  description: "",
  owner: { id: "", displayValue: "" },
});

const errors = ref({
  name: "",
  address: "",
  owner: "",
});

const contacts = ref<PersonContact[]>([]);

onMounted(async () => {
  try {
    contacts.value = await contactService.getAll();
  } catch (err) {
    console.error("Ошибка загрузки владельцев:", err);
  }
});

watch(
  () => props.warehouse,
  (newWarehouse) => {
    if (newWarehouse) {
      localWarehouse.value = {
        ...newWarehouse,
        owner: { ...newWarehouse.owner },
      };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = { name: "", address: "", owner: "" };
  let isValid = true;

  if (!localWarehouse.value.name) {
    errors.value.name = "Название обязательно";
    isValid = false;
  }
  if (!localWarehouse.value.address) {
    errors.value.address = "Адрес обязателен";
    isValid = false;
  }
  if (!localWarehouse.value.owner.id) {
    errors.value.owner = "Владелец обязателен";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localWarehouse.value });
  }
}
</script>
