<template>
  <div class="invoice-detail-page">
    <Card>
      <template #title>Накладная </template>
      <template #content>
        <div class="details-container">
          <div class="detail-item">
            <label>Номер:</label>
          </div>
          <div class="detail-item">
            <label>Дата:</label>
            <span></span>
          </div>
          <div class="detail-item">
            <label>Тип:</label>
            <span></span>
          </div>
          <div class="detail-item">
            <label>Создатель:</label>
            <span></span>
          </div>
          <div class="detail-item">
            <label>Назначено:</label>
            <span></span>
          </div>
          <div class="detail-item">
            <label>Статус:</label>
            <span></span>
          </div>
        </div>
        <div class="actions-container">
          <Button label="Назад" icon="pi pi-arrow-left" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.invoice-detail-page {
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
.actions-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
