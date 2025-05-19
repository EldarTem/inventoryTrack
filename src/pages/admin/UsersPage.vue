<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "primevue/usetoast";
import UserModal from "@/components/widgets/UserModal.vue";
import ContactsTab from "@/components/ContactsTab.vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import type { User } from "@/types/models";

const userStore = useUserStore();
const toast = useToast();
const isLoading = ref(false);
const error = ref<string | null>(null);
const showModal = ref(false);
const isEditMode = ref(false);
const selectedUser = ref<User | null>(null);

const filters = ref<{
  search: string;
  status: string | undefined;
  date: Date | null;
}>({
  search: "",
  status: undefined,
  date: null,
});



const filteredUsers = computed(() => {
  let result = userStore.users || [];
  if (filters.value.search) {
    result = result.filter((u) =>
      u.login.toLowerCase().includes(filters.value.search.toLowerCase())
    );
  }
  if (filters.value.status) {
    result = result.filter((u) =>
      filters.value.status === "active" ? u.isActive : !u.isActive
    );
  }
  return result;
});

const columns = [
  { field: "login", header: "Логин" },
  { field: "contact.displayValue", header: "Контакт" },
  { field: "role.displayValue", header: "Роль" },
  { header: "Действия" },
];

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    console.log("Fetching users...");
    await userStore.fetchAll();
    console.log("Users fetched:", userStore.users);
  } catch (err) {
    error.value =
      "Не удалось загрузить сотрудников: " +
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
  selectedUser.value = {
    id: "",
    login: "",
    password: "",
    role: { code: "Manager", displayValue: "Менеджер" },
    contact: { id: "", displayValue: "" },
    isActive: true,
  };
  isEditMode.value = false;
  showModal.value = true;
}

function openEditModal(user: User) {
  selectedUser.value = { ...user };
  isEditMode.value = true;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedUser.value = null;
}

async function saveUser(user: User) {
  try {
    const userData = {
      login: user.login,
      role: user.role.code,
      contactId: user.contact?.id || "",
      ...(isEditMode.value
        ? user.password
          ? { password: user.password }
          : {}
        : { password: user.password || "" }),
    };
    if (isEditMode.value) {
      await userStore.update(user.id, userData);
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Сотрудник обновлен",
        life: 3000,
      });
    } else {
      if (!userData.password) {
        throw new Error("Пароль обязателен при создании пользователя");
      }
      await userStore.create(
        userData as {
          login: string;
          password: string;
          role: string;
          contactId: string;
        }
      );
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Сотрудник создан",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось сохранить сотрудника: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  } finally {
    showModal.value = false;
    selectedUser.value = null;
  }
}

async function deleteUser(id: string) {
  try {
    await userStore.remove(id);
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Сотрудник удален",
      life: 3000,
    });
  } catch (err) {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail:
        "Не удалось удалить сотрудника: " +
        (err instanceof Error ? err.message : "Неизвестная ошибка"),
      life: 3000,
    });
  }
}


</script>

<template>
  <div class="users-page">
    <TabView>
      <TabPanel header="Сотрудники" value="users">
        <ProgressSpinner v-if="isLoading" class="loader" />
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else>
          <div class="actions-container">
            <Button
              v-if="filteredUsers && filteredUsers.length"
              label="Добавить сотрудника"
              icon="pi pi-plus"
              class="p-button-lg"
              @click="openCreateModal"
            />
          </div>

          <DataTable
            v-if="filteredUsers && filteredUsers.length"
            :value="filteredUsers"
            :columns="columns"
            row-key="id"
            paginator
            :rows="10"
            class="users-table"
            scrollable
          >
            <Column field="login" header="Логин" frozen />
            <Column header="Контакт">
              <template #body="{ data }">
                {{ data.contact?.displayValue || "—" }}
              </template>
            </Column>
            <Column header="Роль">
              <template #body="{ data }">
                {{ data.role?.displayValue || "—" }}
              </template>
            </Column>
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
                    @click.stop="deleteUser(data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
          <div v-else class="no-data">
            <p>Сотрудники отсутствуют</p>
            <Button
              label="Создать первого сотрудника"
              icon="pi pi-plus"
              class="p-button-lg"
              @click="openCreateModal"
            />
          </div>
          <UserModal
            v-if="showModal"
            :visible="showModal"
            :user="selectedUser"
            :isEdit="isEditMode"
            @save="saveUser"
            @cancel="closeModal"
          />
        </div>
      </TabPanel>
      <TabPanel header="Контакты" value="contacts">
        <ContactsTab />
      </TabPanel>
    </TabView>
  </div>
</template>
