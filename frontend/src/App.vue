<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <RouterView />
  </div>
</template>
<style lang="css" scoped>
.app-container {
  display: flex;
  height: 100vh;
  position: relative;
  padding: 0;
  margin: 0;
}
</style>
