<script setup lang="ts">
import Player from '@/components/Player.vue'
</script>

<template>
  <div class="wrapper">
    <div>
      <div></div>
      <RouterView />
    </div>
    <footer style="margin-top: auto">
      <Player />
    </footer>
  </div>
</template>

<style scoped lang="sass">

.wrapper
  min-height: 100vh
  display: flex
  flex-direction: column
  background: #1e1e1e
</style>
