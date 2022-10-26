<script setup lang="ts">
import { storage } from './firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { onBeforeMount, ref } from 'vue'

const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')

const music = ref()

onBeforeMount(async () => {
  const { items } = await listAll(gsReference)

  items.forEach(async (itemRef) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))
    music.value = new Audio(url)
    console.log(url)
  })
})
</script>

<template>
  <button @click="music.play()">click</button>
  <button @click="music.pause()">stop</button>
  <RouterView />
</template>

<style scoped></style>
