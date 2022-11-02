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
  volume: number
}

interface IcurrentTime {
  minutes: number
  seconds: number
}

const setTitlePage = () => {
  if (activeMusic.value && currentTime.value) {
    document.title = `${activeMusic.value.name.split('.')[0]} - ${
      currentTime.value.minutes
    }:${currentTime.value.seconds}`
  }
}

const unSortMusics = ref<Imusics[]>([])
const musics = computed<Imusics[]>(() =>
  [...unSortMusics.value].sort((a, b) => a.name.localeCompare(b.name))
)
const activeMusic = ref<Imusics | null>(null)
const currentTime = ref<IcurrentTime | null>(null)

onBeforeMount(async () => {
  const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')
  const { items } = await listAll(gsReference)

  items.forEach(async (itemRef, index) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))

    const audio = new Audio(url)

    audio.oncanplay = () => {
      const music = {
        name: itemRef.name,
        music: new Audio(url),
        minutes: Math.floor(audio.duration / 60),
        seconds: Math.floor(audio.duration % 60),
        volume: 1,
      }
      if (!index) {
        activeMusic.value = music
        const minutes = Math.floor(activeMusic.value.music.currentTime / 60)
        const seconds = Math.floor(activeMusic.value.music.currentTime % 60)
        currentTime.value = { minutes, seconds }
      }
      unSortMusics.value.push(music)
    }
  })
})

watch(
  () => activeMusic.value?.music,
  (cur) => {
    if (cur) setTitlePage()
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

const interval = ref(0)
const play = () => {
  activeMusic.value?.music.play()
  interval.value = window.setInterval(() => {
    if (activeMusic.value) {
      const minutes = Math.floor(activeMusic.value.music.currentTime / 60)
      const seconds = Math.floor(activeMusic.value.music.currentTime % 60)
      currentTime.value = { minutes, seconds }
      console.log(minutes, seconds)
      if (
        activeMusic.value.music.currentTime >= activeMusic.value.music.duration
      ) {
        clearInterval(interval.value)
      }
      setTitlePage()
    }
  }, 1000)
}

const pause = () => {
  activeMusic.value?.music.pause()
  clearInterval(interval.value)
}

const setVolume = () => {
  if (activeMusic.value) {
    activeMusic.value.music.volume = activeMusic.value.volume
  }
}
</script>

<template>
  <div v-if="activeMusic" class="root">
    <div class="wrapper">
      <div>{{ currentTime?.minutes }}:{{ currentTime?.seconds }}</div>
      <div>qwe</div>
      <div>{{ activeMusic.minutes }} : {{ activeMusic.seconds }}</div>

      <button @click="play">play</button>
      <button @click="pause">pause</button>
      <button v-if="activeMusic.name !== musics[0].name" @click="setPrevMusic">
        <PrevSVG />
      </button>
      <button
        v-if="activeMusic.name !== musics[musics.length - 1].name"
        @click="setNextMusic"
      >
        <NextSVG />
      </button>
      <div>
        <input
          v-model="activeMusic.volume"
          step="0.01"
          type="range"
          max="1"
          min="0"
          @input="setVolume"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.root
  display: flex
  justify-content: center
  align-items: center
  background: #f1f3f4


.wrapper
  // display: flex
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
  // display: flex
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
