<script setup lang="ts"></script>

<template>
  <div>
    <div class="container">
      <section>
        <div class="music-loader">
          <div class="line line1"></div>
          <div class="line line2"></div>
          <div class="line line3"></div>
          <div class="line line4"></div>
          <div class="line line5"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
body {
  background: black;
}

.container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

section {
  width: 100%;
}

.music-loader {
  position: relative;
  width: 120px;
  height: 80px;
}

.line {
  width: 10px;
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
  left: 20px;
  animation: dance 0.4s 0.2s ease alternate infinite;
}

.line3 {
  left: 40px;
  animation: dance 0.45s 0.4s ease alternate infinite;
}

.line4 {
  left: 60px;
  animation: dance 0.5s 0.3s ease alternate infinite;
}

.line5 {
  left: 80px;
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
