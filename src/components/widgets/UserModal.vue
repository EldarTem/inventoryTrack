<script lang="ts" setup>
import { ref, watch, onMounted } from "vue";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { contactService } from "@/services/contactService";
import type { User, Role, PersonContact } from "@/types/models";

const props = defineProps<{
  visible: boolean;
  user: User | null;
  isEdit: boolean;
}>();

const emit = defineEmits<{
  (e: "save", user: User): void;
  (e: "cancel"): void;
}>();

const localUser = ref<User>({
  id: "",
  login: "",
  password: "",
  role: { code: "Manager", displayValue: "Менеджер" },
  contact: { id: "", displayValue: "" },
  isActive: true,
});

const errors = ref({
  login: "",
  password: "",
  role: "",
  contact: "",
  isActive: "",
});

const roles = ref<Role[]>([
  { code: "Manager", displayValue: "Менеджер" },
  { code: "Storekeeper", displayValue: "Кладовщик" },
  { code: "Administrator", displayValue: "Администратор" },
]);

const contacts = ref<PersonContact[]>([]);

const statusOptions = ref([
  { label: "Активен", value: true },
  { label: "Неактивен", value: false },
]);

onMounted(async () => {
  try {
    contacts.value = await contactService.getAll();
  } catch (err) {
    console.error("Ошибка загрузки контактов:", err);
  }
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      localUser.value = {
        ...newUser,
        role: { ...newUser.role },
        contact: newUser.contact
          ? { ...newUser.contact }
          : { id: "", displayValue: "" },
      };
    }
  },
  { immediate: true }
);

function validateForm() {
  errors.value = {
    login: "",
    password: "",
    role: "",
    contact: "",
    isActive: "",
  };
  let isValid = true;

  if (!localUser.value.login) {
    errors.value.login = "Логин обязателен";
    isValid = false;
  }
  if (!props.isEdit && !localUser.value.password) {
    errors.value.password = "Пароль обязателен";
    isValid = false;
  }
  if (!localUser.value.role.code) {
    errors.value.role = "Роль обязательна";
    isValid = false;
  }
  if (!localUser.value.contact?.id) {
    errors.value.contact = "Контакт обязателен";
    isValid = false;
  }
  if (localUser.value.isActive === undefined) {
    errors.value.isActive = "Статус обязателен";
    isValid = false;
  }

  return isValid;
}

function handleSave() {
  if (validateForm()) {
    emit("save", { ...localUser.value });
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="isEdit ? 'Редактировать сотрудника' : 'Создать сотрудника'"
    :modal="true"
    :style="{ width: '600px' }"
    @update:visible="emit('cancel')"
    class="user-modal"
  >
    <div class="form-container">
      <div class="form-field">
        <label for="login">Логин</label>
        <InputText
          id="login"
          v-model="localUser.login"
          placeholder="Введите логин"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.login }"
        />
        <small v-if="errors.login" class="p-error">{{ errors.login }}</small>
      </div>
      <div class="form-field">
        <label for="password">Пароль</label>
        <InputText
          id="password"
          v-model="localUser.password"
          type="password"
          placeholder="Введите пароль"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.password }"
        />
        <small v-if="errors.password" class="p-error">{{
          errors.password
        }}</small>
      </div>
      <div class="form-field">
        <label for="role">Роль</label>
        <Dropdown
          id="role"
          v-model="localUser.role.code"
          :options="roles"
          optionLabel="displayValue"
          optionValue="code"
          placeholder="Выберите роль"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.role }"
        />
        <small v-if="errors.role" class="p-error">{{ errors.role }}</small>
      </div>
      <div class="form-field">
        <label for="contact">Контакт</label>
        <Dropdown
          id="contact"
          :model-value="localUser.contact?.id"
          :options="contacts"
          optionLabel="fullName"
          optionValue="id"
          placeholder="Выберите контакт"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.contact }"
          @update:model-value="
            (newValue) =>
              (localUser.contact = {
                id: newValue,
                displayValue:
                  contacts.find((c) => c.id === newValue)?.fullName || '',
              })
          "
        />
        <small v-if="errors.contact" class="p-error">{{
          errors.contact
        }}</small>
      </div>
      <div class="form-field">
        <label for="isActive">Статус</label>
        <Dropdown
          id="isActive"
          v-model="localUser.isActive"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Выберите статус"
          class="p-inputtext-lg"
          :class="{ 'p-invalid': errors.isActive }"
        />
        <small v-if="errors.isActive" class="p-error">{{
          errors.isActive
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
