<template>
  <div class="dashboard-page">
    <Card title="Панель управления кладовщика">
      <template #content>
        <div class="stats-container">
          <Card class="stat-card">
            <template #title>Открытые инвентаризации</template>
            <template #content>
            </template>
          </Card>
          <Card class="stat-card">
            <template #title>Закрытые инвентаризации</template>
            <template #content>
            </template>
          </Card>
          <Card class="stat-card">
            <template #title>Всего складов</template>
            <template #content>
            </template>
          </Card>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>

import Card from "primevue/card";



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
  flex: 1 1 300px;
  text-align: center;
}
</style>
