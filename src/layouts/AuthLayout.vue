<template>
  <div class="auth-layout">
    <router-view />
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}
</style>
