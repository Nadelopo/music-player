<script setup lang="ts">
import HomeSVG from '@/assets/icons/home.svg?component'
</script>

<template>
  <div>
    <div class="sidebar">
      <ul>
        <li>
          <router-link class="flex items-center gap-4" to="/">
            <HomeSVG fill="#fff" />
            <div class="li__text">Главная</div>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="sass">
.sidebar
  background: #141414
  height: Calc(100vh - 100px)
  padding: 40px 20px
  .li__text
    font-size: 0.875rem
    color: #fff
    font-weight: 700
</style>
