<template>
  <div class="layout">
    <Toast />
    <!-- Добавляем компонент Toast -->
    <div class="sidebar">
      <SidebarMenu />
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts" setup>
import SidebarMenu from "@/components/SidebarMenu.vue";
import Toast from "primevue/toast"; // Импортируем Toast
</script>

<style scoped>
.layout {
  display: flex;
}
.sidebar {
  width: 250px;
  background: #fff;
}
.content {
  flex: 1;
  padding: 20px;
}
</style>
