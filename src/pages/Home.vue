<script setup lang="ts">
import Player from '@/components/Player.vue'
</script>

<template>
  <div class="wrapper">
    <main />
    <footer style="margin-top: auto">
      <Player />
    </footer>
  </div>
</template>

<style scoped lang="sass">

.wrapper
  min-height: Calc(100vh - 20px)
  display: flex
  flex-direction: column
</style>
