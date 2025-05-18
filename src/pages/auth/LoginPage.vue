<template>
  <div class="login-page">
    <Card class="login-card">
      <template #header>
        <div class="card-header">
          <img src="@/assets/logo-label.svg" alt="Логотип" class="logo" />
          <h1>Вход в систему</h1>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleLogin" class="form-container">
          <div class="form-field">
            <label for="login">Логин</label>
            <InputText
              id="login"
              v-model="form.login"
              placeholder="Введите логин"
              class="p-inputtext-lg"
              :class="{ 'p-invalid': loginError }"
            />
            <small v-if="loginError" class="p-error"
              >Введите корректный логин</small
            >
          </div>
          <div class="form-field">
            <label for="password">Пароль</label>
            <Password
              id="password"
              v-model="form.password"
              placeholder="Введите пароль"
              class="p-inputtext-lg"
              :class="{ 'p-invalid': passwordError }"
              :feedback="false"
              toggle-mask
            />
            <small v-if="passwordError" class="p-error">Введите пароль</small>
          </div>
          <div class="form-field buttons">
            <Button
              type="submit"
              label="Войти"
              icon="pi pi-sign-in"
              class="p-button-lg"
              :loading="isLoading"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  login: "",
  password: "",
});

const loginError = ref(false);
const passwordError = ref(false);
const isLoading = ref(false);

async function handleLogin() {
  loginError.value = false;
  passwordError.value = false;
  isLoading.value = true;

  if (!form.login) loginError.value = true;
  if (!form.password) passwordError.value = true;

  if (loginError.value || passwordError.value) {
    isLoading.value = false;
    return;
  }

  try {
    await authStore.login(form);
    const role = authStore.user?.role;
    // Normalize role to string
    const roleCode = typeof role === "string" ? role : role?.code || "";

    if (roleCode === "manager") router.push("/manager/invoices");
    else if (roleCode === "storekeeper") router.push("/storekeeper/dashboard");
    else if (roleCode === "Administrator") router.push("/admin/dashboard");
    else router.push("/auth/login");
  } catch {
    loginError.value = true;
    passwordError.value = true;
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  font-family: "Montserrat", sans-serif;
}

.login-card {
  max-width: 600px; /* стало шире */
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1rem;
}

.card-header .logo {
  margin-bottom: 1rem;
  transition: transform 0.2s;
}

.card-header .logo:hover {
  transform: scale(1.05);
}

.card-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
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

/* Единый стиль для InputText и Password */
.form-field :deep(.p-inputtext),
.form-field :deep(.p-password input) {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-field :deep(.p-inputtext):focus,
.form-field :deep(.p-password input):focus {
  border-color: #4c51bf;
  box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.2);
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
  justify-content: center;
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
</style>
