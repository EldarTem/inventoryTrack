<template>
  <div class="profile-page">
    <Card class="profile-card">
      <template #title>Личный кабинет</template>
      <template #content>
        <form @submit.prevent="handleUpdate" class="form-container">
          <div class="form-field">
            <label for="login">Логин</label>
            <InputText
              id="login"
              v-model="form.login"
              disabled
              class="p-inputtext-lg"
            />
          </div>
          <div class="form-field">
            <label for="role">Роль</label>
            <InputText
              id="role"
              :value="user?.role?.displayValue || ''"
              disabled
              class="p-inputtext-lg"
            />
          </div>
          <div class="form-field">
            <label for="password">Новый пароль</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Введите новый пароль"
              :class="{ 'p-invalid': errors.password }"
              toggleMask
            />
            <small v-if="errors.password" class="p-error">{{
              errors.password
            }}</small>
          </div>
          <div class="form-field buttons">
            <Button
              type="submit"
              label="Обновить"
              icon="pi pi-check"
              class="p-button-lg"
              :disabled="isSubmitting"
              :loading="isSubmitting"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "primevue/usetoast";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import type { User } from "@/types/models";

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();
const user = computed(() => authStore.user);
const isSubmitting = ref(false);

const form = reactive<Partial<User>>({
  login: user.value?.login || "",
  password: "",
});

const errors = reactive({
  password: "",
});

function validateForm() {
  errors.password = "";
  let isValid = true;

  if (form.password && form.password.length < 6) {
    errors.password = "Пароль должен содержать не менее 6 символов";
    isValid = false;
  }

  return isValid;
}

async function handleUpdate() {
  if (!validateForm()) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Пожалуйста, исправьте ошибки в форме",
      life: 3000,
    });
    return;
  }

  if (!user.value) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Пользователь не найден",
      life: 3000,
    });
    return;
  }

  isSubmitting.value = true;
  try {
    const updateData = {
      login: user.value.login,
      role: user.value.role.code,
      contactId:
        user.value.contact?.id || "00000000-0000-0000-0000-000000000000",
      isActive: user.value.isActive,
      password: form.password || user.value.password,
    };
    await userStore.update(user.value.id, updateData);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Профиль обновлен",
      life: 3000,
    });
    form.password = ""; 
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось обновить профиль: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.profile-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.profile-card {
  max-width: 600px;
  width: 100%;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

:deep(.p-card-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  padding: 1rem 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-password) {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-field :deep(.p-inputtext:enabled:focus),
.form-field :deep(.p-password input:focus) {
  border-color: #4c51bf;
  box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.2);
}

.form-field :deep(.p-inputtext:disabled) {
  background: #f7fafc;
  color: #6b7280;
}

.form-field :deep(.p-invalid) {
  border-color: #dc3545 !important;
}

.form-field .p-error {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-field.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.form-field :deep(.p-button) {
  background: #4c51bf;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  font-size: 1rem;
  transition: background 0.3s, transform 0.2s;
}

.form-field :deep(.p-button):hover {
  background: #3b82f6;
  transform: translateY(-2px);
}

.form-field :deep(.p-button:enabled:focus) {
  box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.2);
}

.form-field :deep(.p-button:disabled) {
  background: #6b7280;
  cursor: not-allowed;
}
</style>
