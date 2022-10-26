<script setup lang="ts">
import { storage } from './firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { onBeforeMount, ref } from 'vue'

const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')

const musics = ref<HTMLAudioElement[]>([])
const activeMusic = ref()
onBeforeMount(async () => {
  const { items } = await listAll(gsReference)

  items.forEach(async (itemRef) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))
    musics.value.push(new Audio(url))
    activeMusic.value = musics.value[0]
  })
})
</script>

<template>
  <audio v-if="activeMusic" controls :src="activeMusic.src"></audio>

  <RouterView />
</template>

<style scoped></style>
