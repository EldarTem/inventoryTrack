import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import AuthLayout from '@/layouts/AuthLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LoginPage from '@/pages/auth/LoginPage.vue'
import ProfilePage from '@/pages/auth/ProfilePage.vue'
import ManagerInvoices from '@/pages/manager/InvoicesPage.vue'
import ManagerInvoiceDetail from '@/pages/manager/InvoiceDetail.vue'
import ManagerProducts from '@/pages/manager/ProductsPage.vue'
import StorekeeperDashboard from '@/pages/storekeeper/DashboardPage.vue'
import StorekeeperInventory from '@/pages/storekeeper/InventoryList.vue'
import StorekeeperInventoryDetail from '@/pages/storekeeper/InventoryDetail.vue'
import AdminDashboard from '@/pages/admin/DashboardPage.vue'
import AdminProducts from '@/pages/admin/ProductsPage.vue'
import AdminCategories from '@/pages/admin/CategoriesPage.vue'
import AdminWarehouses from '@/pages/admin/WarehousesPage.vue'
import AdminSuppliers from '@/pages/admin/SuppliersPage.vue'
import AdminUsers from '@/pages/admin/UsersPage.vue'

const routes = [
  {
    path: '/auth',
    component: AuthLayout,
    children: [{ path: 'login', name: 'Login', component: LoginPage }],
  },
  {
    path: '/manager',
    component: DefaultLayout,
    meta: { requiresAuth: true, role: 'manager' },
    children: [
      {
        path: 'invoices',
        name: 'ManagerInvoices',
        component: ManagerInvoices,
      },
      {
        path: 'invoices/:id',
        name: 'ManagerInvoiceDetail',
        component: ManagerInvoiceDetail,
      },
      {
        path: 'products',
        name: 'ManagerProducts',
        component: ManagerProducts,
      },
      {
        path: 'profile',
        name: 'ManagerProfile',
        component: ProfilePage,
      },
    ],
  },
  {
    path: '/storekeeper',
    component: DefaultLayout,
    meta: { requiresAuth: true, role: 'storekeeper' },
    children: [
      {
        path: 'dashboard',
        name: 'StorekeeperDashboard',
        component: StorekeeperDashboard,
      },
      {
        path: 'inventory',
        name: 'StorekeeperInventory',
        component: StorekeeperInventory,
      },
      {
        path: 'inventory/:id',
        name: 'StorekeeperInventoryDetail',
        component: StorekeeperInventoryDetail,
      },
      {
        path: 'profile',
        name: 'StorekeeperProfile',
        component: ProfilePage,
      },
    ],
  },
  {
    path: '/admin',
    component: DefaultLayout,
    meta: { requiresAuth: true, role: 'Administrator' },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: AdminProducts,
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: AdminCategories,
      },
      {
        path: 'warehouses',
        name: 'AdminWarehouses',
        component: AdminWarehouses,
      },
      {
        path: 'suppliers',
        name: 'AdminSuppliers',
        component: AdminSuppliers,
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: AdminUsers,
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: ProfilePage,
      },
    ],
  },
  {
    path: '/',
    redirect: '/auth/login',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.user?.role?.code || '' // Normalize to string

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth/login')
  } else if (to.meta.role && userRole !== to.meta.role) {
    next('/auth/login')
  } else if (to.path === '/auth/login' && isAuthenticated) {
    if (userRole === 'manager') next('/manager/invoices')
    else if (userRole === 'storekeeper') next('/storekeeper/dashboard')
    else if (userRole === 'Administrator') next('/admin/dashboard')
    else next()
  } else {
    next()
  }
})

export default router
