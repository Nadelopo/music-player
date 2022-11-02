<script setup lang="ts">
import { storage } from '@/firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { computed, onBeforeMount, ref, watch } from 'vue'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'

interface Imusics {
  name: string
  music: HTMLAudioElement
  minutes: number
  seconds: number
}

const setDocumentTitle = (name: string) => {
  document.title = name
}

const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')

const unSortMusics = ref<Imusics[]>([])
const musics = computed<Imusics[]>(() =>
  [...unSortMusics.value].sort((a, b) => a.name.localeCompare(b.name))
)
const activeMusic = ref<Imusics | null>(null)
onBeforeMount(async () => {
  const { items } = await listAll(gsReference)

  items.forEach(async (itemRef, index) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))

    const audio = new Audio(url)
    audio.oncanplay = () => {
      const music = {
        name: itemRef.name,
        music: new Audio(url),
        minutes: Math.round(audio.duration / 60),
        seconds: Math.round(audio.duration % 60),
      }
      if (!index) {
        console.log(music)
        activeMusic.value = music
      }
      unSortMusics.value.push(music)
    }
  })
})

watch(
  () => activeMusic.value?.music,
  (cur) => {
    if (cur) {
      if (activeMusic.value) {
        setDocumentTitle(activeMusic.value.name)
      }
    }
  }
)

const setNextMusic = () => {
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = musics.value[i + 1]
      break
    }
  }
}

const setPrevMusic = () => {
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = musics.value[i - 1]
      break
    }
  }
}
</script>

<template>
  <div v-if="activeMusic">
    <div>{{ activeMusic.minutes }} : {{ activeMusic.seconds }}</div>

    <button @click="activeMusic?.music.play()">play</button>
    <button @click="activeMusic?.music.pause()">pause</button>
    <button v-if="activeMusic.name !== musics[0].name" @click="setPrevMusic">
      prev
    </button>
    <button
      v-if="activeMusic.name !== musics[musics.length - 1].name"
      @click="setNextMusic"
    >
      next
    </button>
  </div>
</template>

<style scoped lang="sass">

.root
  display: flex
  justify-content: center
  align-items: center
  background: #f1f3f4


.wrapper
  display: flex
  justify-content: center
  align-items: center
  border-radius: 25px
  background: #f1f3f4
  width: 40%
  height: 54px
  audio
    width: 100%
    height: 40px
    &:focus-visible
      outline: none


.player__buttons
  background: none
  outline: none
  border: none
  display: flex
  justify-content: center
  align-items: center
  cursor: pointer
  &:focus-visible
    border: 1px solid #000
    border-radius: 10px

.left
  margin-right: 6px
  margin-left: 10px

.right
  margin-left: 6px
</style>
