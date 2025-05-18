<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { organizationService } from "@/services/organizationService";
import type { PersonContact, Organization } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  contact: PersonContact | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", contact: PersonContact): void;
  (e: "cancel"): void;
}>();

const localContact = ref<PersonContact>({
  id: "",
  fullName: "",
  position: "",
  phone: "",
  email: "",
  organization: undefined,
});

const errors = ref({
  fullName: "",
  position: "",
  phone: "",
  email: "",
});

const organizations = ref<Organization[]>([]);

onMounted(async () => {
  try {
    organizations.value = await organizationService.getAll();
  } catch (err) {
    console.error("Ошибка загрузки организаций:", err);
  }
});

watch(
  () => props.contact,
  (newContact) => {
    if (newContact) {
      localContact.value = {
        ...newContact,
        organization: newContact.organization
          ? { ...newContact.organization }
          : undefined,
      };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = {
    fullName: "",
    position: "",
    phone: "",
    email: "",
  };
  let isValid = true;

  if (!localContact.value.fullName) {
    errors.value.fullName = "ФИО обязательно";
    isValid = false;
  }
  if (!localContact.value.position) {
    errors.value.position = "Должность обязательна";
    isValid = false;
  }
  if (!localContact.value.phone) {
    errors.value.phone = "Телефон обязателен";
    isValid = false;
  }
  if (!localContact.value.email) {
    errors.value.email = "Email обязателен";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localContact.value });
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать контакт' : 'Создать контакт'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="contact-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="fullName">ФИО</label>
        <InputText
          id="fullName"
          v-model="localContact.fullName"
          placeholder="Введите ФИО"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.fullName }"
        />
        <small v-if="errors.fullName" class="p-error">{{
          errors.fullName
        }}</small>
      </div>
      <div class="form-field">
        <label for="position">Должность</label>
        <InputText
          id="position"
          v-model="localContact.position"
          placeholder="Введите должность"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.position }"
        />
        <small v-if="errors.position" class="p-error">{{
          errors.position
        }}</small>
      </div>
      <div class="form-field">
        <label for="phone">Телефон</label>
        <InputText
          id="phone"
          v-model="localContact.phone"
          placeholder="Введите телефон"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.phone }"
        />
        <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
      </div>
      <div class="form-field">
        <label for="email">Email</label>
        <InputText
          id="email"
          v-model="localContact.email"
          placeholder="Введите email"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
      </div>
      <div class="form-field">
        <label for="organization">Организация (опционально)</label>
        <Dropdown
          id="organization"
          :model-value="localContact.organization?.id"
          :options="organizations"
          optionLabel="name"
          optionValue="id"
          placeholder="Выберите организацию"
          class="p-inputtext-lg"
          @update:model-value="
            (newValue) =>
              (localContact.organization = newValue
                ? {
                    id: newValue,
                    displayValue:
                      organizations.find((o) => o.id === newValue)?.name || '',
                  }
                : undefined)
          "
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
