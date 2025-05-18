<template>
  <div class="invoices-page">
    <div class="actions-container">
      <Button
        label="Создать накладную"
        icon="pi pi-plus"
      />
    </div>
    <filter-panel

    />
    <DataTable

    >
      <Column field="number" header="Номер" />
      <Column field="date" header="Дата" />
      <Column field="type" header="Тип" />
      <Column field="createdBy" header="Создатель" />
      <Column field="assignedTo" header="Назначено" />
      <Column field="status" header="Статус" />
      <Column header="Действия">
        <template #body="">
          <div class="actions-container">
            <Button
              label="Одобрить"
              severity="success"
            />
            <Button
              label="Отклонить"
              severity="danger"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.invoices-page {
  padding: 20px;
}
.actions-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
</style>
