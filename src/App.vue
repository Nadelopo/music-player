<script setup lang="ts">
import Player from '@/components/Player.vue'
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="root">
    <div class="grid">
      <Sidebar />
      <RouterView />
    </div>
    <footer style="margin-top: auto">
      <Player />
    </footer>
  </div>
</template>

<style scoped lang="sass">

.root
  min-height: 100vh
  display: flex
  flex-direction: column
  background: #1e1e1e
  .grid
    display: grid
    grid-template-columns: 300px 1fr
</style>
