<template>
  <div class="inventory-list-page">
    <Button
      label="Создать инвентаризацию"
      icon="pi pi-plus"
    />

    <DataTable

    >
      <Column field="id" header="ID" />
      <Column field="warehouse" header="Склад" />
      <Column field="date" header="Дата" />
      <Column field="status" header="Статус" />
      <Column header="Действия">
        <template #body="{ data }">
          <Button
            v-if="data.status === 'open'"
            label="Закрыть"
            severity="success"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.inventory-list-page {
  padding: 20px;
}
</style>
