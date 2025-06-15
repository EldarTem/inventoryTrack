<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <img src="@/assets/logo-label.svg" alt="Логотип" class="logo" />
    </div>

    <Menu :model="menuItems" class="sidebar-menu">
      <template #item="{ item }">
        <a
          class="p-menuitem-link"
          :class="{ active: isActive(item.route), 'footer-item': item.footer }"
          @click="handleItemClick(item)"
        >
          <i :class="item.icon"></i>
          <span class="p-menuitem-text">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </aside>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Menu from "primevue/menu";
import type { MenuItem, MenuItemCommandEvent } from "primevue/menuitem";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const isCollapsed = ref(false);

const userRole = computed(() => {
  const role = authStore.user?.role;
  if (typeof role === "string") {
    return role;
  }
  if (role && typeof role === "object" && "code" in role) {
    return role.code;
  }
  return "";
});

const isAuthenticated = computed(() => !!authStore.user);

function isActive(routeName: string) {
  return route.name === routeName;
}

function navigateTo(routeName: string) {
  router.push({ name: routeName });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function logout(_event: MenuItemCommandEvent) {
  authStore.logout();
  router.push("/auth/login");
}

const profileRoute = computed(() => {
  if (userRole.value === "manager") return "ManagerProfile";
  if (userRole.value === "storekeeper") return "StorekeeperProfile";
  if (userRole.value === "administrator") return "AdminProfile";
  return "";
});

function handleItemClick(item: MenuItem) {
  if (item.command) {
    item.command({ originalEvent: new Event("click"), item });
  } else if (item.route) {
    navigateTo(item.route);
  }
}

const menuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [];

  if (userRole.value === "manager" && isAuthenticated.value) {
    items.push(
      { label: "Накладные", icon: "pi pi-file", route: "ManagerInvoices" },
      { label: "Товары", icon: "pi pi-box", route: "ManagerProducts" }
    );
  }
  if (userRole.value === "storekeeper" && isAuthenticated.value) {
    items.push(
      {
        label: "Заказы",
        icon: "pi pi-receipt",
        route: "StorekeeperDashboard",
      },
      {
        label: "Инвентаризация",
        icon: "pi pi-list",
        route: "StorekeeperInventory",
      }
    );
  }
  if (userRole.value === "administrator" && isAuthenticated.value) {
    items.push(
      { label: "Заказы", icon: "pi pi-receipt", route: "AdminDashboard" },
      { label: "Товары", icon: "pi pi-box", route: "AdminProducts" },
      { label: "Склады", icon: "pi pi-building", route: "AdminWarehouses" },
      { label: "Категории", icon: "pi pi-tags", route: "AdminCategories" },
      { label: "Поставщики", icon: "pi pi-truck", route: "AdminSuppliers" },
      { label: "Сотрудники", icon: "pi pi-id-card", route: "AdminUsers" }
    );
  }

  items.push({ separator: true });

  if (isAuthenticated.value) {
    items.push(
      {
        label: "Личный кабинет",
        icon: "pi pi-user",
        route: profileRoute.value,
        footer: true,
      },
      { label: "Выйти", icon: "pi pi-sign-out", command: logout, footer: true }
    );
  }

  return items;
});
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
  color: #edf2f7;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  font-family: "Montserrat", sans-serif;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 80px;
}
.sidebar.collapsed .p-menuitem-text {
  display: none;
}
.sidebar.collapsed .p-menuitem-link {
  justify-content: center;
  padding: 0.75rem;
}
.sidebar.collapsed .sidebar-header {
  padding: 1rem;
}
.sidebar.collapsed .logo {
  max-width: 50px;
}

.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.logo {
  max-width: 160px;
  transition: transform 0.2s;
}
.logo:hover {
  transform: scale(1.05);
}

.sidebar-menu {
  flex-grow: 1;
  border: none;
  background: transparent;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.p-menuitem-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  margin: 0.25rem 0.5rem;
  border-radius: 8px;
  color: #4c51bf;
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.p-menuitem-link.active {
  background: #4c51bf;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.p-menuitem-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(5px);
  color: #4c51bf;
}

.p-menuitem-link i {
  font-size: 1.5rem;
  transition: transform 0.2s;
}
.p-menuitem-link:hover i {
  transform: scale(1.1);
}

.p-menuitem-text {
  font-family: "Montserrat", sans-serif;
  font-weight: 500;
}

.p-menuitem-link.footer-item {
  margin-top: auto;
  opacity: 0.9;
}

.p-menu-separator {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 1rem 0;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 80px;
  }
  .sidebar.collapsed {
    width: 80px;
  }
  .p-menuitem-text {
    display: none;
  }
  .p-menuitem-link {
    justify-content: center;
    padding: 0.75rem;
  }
  .sidebar-header {
    padding: 1rem;
  }
  .logo {
    max-width: 50px;
  }
  .toggle-button {
    display: none;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
}
</style>
