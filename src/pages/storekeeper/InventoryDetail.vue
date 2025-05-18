<template>
  <div class="inventory-detail-page">
    <Card>
      <template #title>Инвентаризация #</template>
      <template #content>
        <div class="details-container">
          <div class="detail-item">
            <label>ID:</label>
          </div>
          <div class="detail-item">
            <label>Склад:</label>
          </div>
          <div class="detail-item">
            <label>Дата:</label>
          </div>
          <div class="detail-item">
            <label>Статус:</label>
          </div>
        </div>
        <Button label="Назад" icon="pi pi-arrow-left" />
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.inventory-detail-page {
  padding: 20px;
}
.details-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
label {
  font-weight: bold;
  width: 100px;
}
</style>
