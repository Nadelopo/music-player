<script setup lang="ts"></script>

<template>
  <div>
    <div class="container">
      <div class="music-loader">
        <div class="line line1"></div>
        <div class="line line2"></div>
        <div class="line line3"></div>
        <div class="line line4"></div>
        <div class="line line5"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-loader {
  position: relative;
  width: 100%;
  height: 30px;
}

.line {
  width: 2px;
  position: absolute;
  border-radius: 5px;
  bottom: 0;
  background: rgb(29, 185, 84);
}

.line1 {
  left: 0;
  animation: dance 0.5s ease alternate infinite;
}

.line2 {
  left: 5px;
  animation: dance 0.4s 0.2s ease alternate infinite;
}

.line3 {
  left: 10px;
  animation: dance 0.45s 0.4s ease alternate infinite;
}

.line4 {
  left: 15px;
  animation: dance 0.5s 0.3s ease alternate infinite;
}

.line5 {
  left: 20px;
  animation: dance 0.6s 0.1s ease alternate infinite;
}

@keyframes dance {
  0% {
    height: 0;
  }
  100% {
    height: 100%;
  }
}
</style>
