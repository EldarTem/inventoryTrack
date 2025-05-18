<template>
  <div class="dashboard-page">
    <ProgressSpinner v-if="isLoading" class="loader" />
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <Card v-if="hasData" title="Панель управления администратора">
        <template #content>
          <div class="stats-container">
            <Card class="stat-card">
              <template #title>Всего товаров</template>
              <template #content>
                <h3>{{ stats.totalProducts }}</h3>
              </template>
            </Card>
            <Card class="stat-card">
              <template #title>Всего складов</template>
              <template #content>
                <h3>{{ stats.totalWarehouses }}</h3>
              </template>
            </Card>
            <Card class="stat-card">
              <template #title>Всего поставщиков</template>
              <template #content>
                <h3>{{ stats.totalSuppliers }}</h3>
              </template>
            </Card>
            <Card class="stat-card">
              <template #title>Всего сотрудников</template>
              <template #content>
                <h3>{{ stats.totalUsers }}</h3>
              </template>
            </Card>
          </div>
        </template>
      </Card>
      <div v-else class="no-data">Данные отсутствуют</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useWarehouseStore } from "@/stores/warehouseStore";
import { useOrganizationStore } from "@/stores/organizationStore";
import { useUserStore } from "@/stores/userStore";
import Card from "primevue/card";
import ProgressSpinner from "primevue/progressspinner";

const productStore = useProductStore();
const warehouseStore = useWarehouseStore();
const organizationStore = useOrganizationStore();
const userStore = useUserStore();
const isLoading = ref(false);
const error = ref<string | null>(null);

onMounted(async () => {
  isLoading.value = true;
  error.value = null;
  try {
    await Promise.all([
      productStore.fetchAll(),
      warehouseStore.fetchAll(),
      organizationStore.filter(), // Fetch suppliers only
      userStore.fetchAll(),
    ]);
  } catch (err) {
    error.value =
      "Не удалось загрузить данные: " +
      (err instanceof Error ? err.message : "Неизвестная ошибка");
  } finally {
    isLoading.value = false;
  }
});

const stats = computed(() => ({
  totalProducts: productStore.products.length,
  totalWarehouses: warehouseStore.warehouses.length,
  totalSuppliers: organizationStore.organizations.length,
  totalUsers: userStore.users.length,
}));

const hasData = computed(
  () =>
    stats.value.totalProducts > 0 ||
    stats.value.totalWarehouses > 0 ||
    stats.value.totalSuppliers > 0 ||
    stats.value.totalUsers > 0
);
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
}
.stats-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.stat-card {
  flex: 1 1 250px;
  text-align: center;
}
.loader {
  margin: 20px auto;
  display: block;
}
.error {
  color: red;
  text-align: center;
  margin: 20px;
}
.no-data {
  text-align: center;
  color: #666;
  margin: 20px;
}
</style>
