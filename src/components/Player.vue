<script setup lang="ts">
import { storage } from '@/firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { computed, onBeforeMount, ref, watch } from 'vue'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'

interface Imusics {
  name: string
  author: string
  music: HTMLAudioElement
  minutes: number
  seconds: number
  volume: number
  time: number
}

interface IcurrentTime {
  minutes: number
  seconds: number
}

const setTitlePage = () => {
  if (activeMusic.value && currentTime.value) {
    document.title = `${activeMusic.value.name} - ${currentTime.value.minutes}:${currentTime.value.seconds}`
  }
}

const getMinutesAndSeconds = (musicTime: number) => {
  const minutes = Math.floor(musicTime / 60)
  const seconds = Math.floor(musicTime % 60)
  return { minutes, seconds }
}

const setVolume = () => {
  if (activeMusic.value) {
    activeMusic.value.music.volume = activeMusic.value.volume
  }
}

const unSortMusics = ref<Imusics[]>([])
const musics = computed<Imusics[]>(() =>
  [...unSortMusics.value].sort((a, b) => a.name.localeCompare(b.name))
)
const activeMusic = ref<Imusics | null>(null)
const currentTime = ref<IcurrentTime | null>(null)
const isChangeTime = ref(true)

onBeforeMount(async () => {
  const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')
  const { items } = await listAll(gsReference)

  items.forEach(async (itemRef, index) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))
    const audio = new Audio(url)
    audio.oncanplay = () => {
      const music = {
        name: itemRef.name.split('-')[0],
        author: itemRef.name.split('-')[1].split('.')[0],
        music: new Audio(url),
        minutes: Math.floor(audio.duration / 60),
        seconds: Math.floor(audio.duration % 60),
        volume: 0.3,
        time: 0,
      }
      if (!index) {
        activeMusic.value = music
        const { minutes, seconds } = getMinutesAndSeconds(
          activeMusic.value.music.currentTime
        )
        currentTime.value = { minutes, seconds }
        setVolume()
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

const resetMusicTime = () => {
  if (activeMusic.value) {
    activeMusic.value.music.currentTime = 0
    activeMusic.value.time = 0
    const { minutes, seconds } = getMinutesAndSeconds(
      activeMusic.value.music.currentTime
    )
    currentTime.value = { minutes, seconds }
  }
  pause()
}

const setNextMusic = () => {
  resetMusicTime()
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = musics.value[i + 1]
      break
    }
  }
  play()
  setVolume()
}

const setPrevMusic = () => {
  resetMusicTime()
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = musics.value[i - 1]
      break
    }
  }
  play()
  setVolume()
}

const interval = ref(0)
const play = () => {
  activeMusic.value?.music.play()
  interval.value = window.setInterval(() => {
    if (activeMusic.value) {
      if (isChangeTime.value) {
        const { minutes, seconds } = getMinutesAndSeconds(
          activeMusic.value.music.currentTime
        )
        currentTime.value = { minutes, seconds }
        activeMusic.value.time++
      }
      if (
        activeMusic.value.music.currentTime >= activeMusic.value.music.duration
      ) {
        clearInterval(interval.value)
        setNextMusic()
      }
    }
    setTitlePage()
  }, 1000)
}

const pause = () => {
  activeMusic.value?.music.pause()
  clearInterval(interval.value)
}

const setVisibleTime = () => {
  if (activeMusic.value) {
    isChangeTime.value = false
    const { minutes, seconds } = getMinutesAndSeconds(activeMusic.value.time)
    currentTime.value = { minutes, seconds }
  }
}

const setCurrentTime = () => {
  if (activeMusic.value) {
    isChangeTime.value = true
    activeMusic.value.music.currentTime = activeMusic.value.time
    const { minutes, seconds } = getMinutesAndSeconds(
      activeMusic.value.music.currentTime
    )
    currentTime.value = { minutes, seconds }
  }
}

const modifiedSeconds = (seconds: number) =>
  seconds < 10 ? `0${seconds}` : String(seconds)

const isLastMusic = computed(() => {
  let value = false
  if (activeMusic.value) {
    value = activeMusic.value.name !== musics.value[0].name
  }
  return value
})

const isFirstMusic = computed(() => {
  let value = false
  if (activeMusic.value) {
    value =
      activeMusic.value.name !== musics.value[musics.value.length - 1].name
  }
  return value
})
</script>

<template>
  <div v-if="activeMusic" class="root">
    <div class="wrapper">
      <div>{{ activeMusic.name }}</div>
      <div v-if="currentTime">
        {{ currentTime.minutes }}:{{ modifiedSeconds(currentTime.seconds) }}
      </div>
      <div>qwe</div>
      <div>
        {{ activeMusic.minutes }} : {{ modifiedSeconds(activeMusic.seconds) }}
      </div>

      <button @click="play">play</button>
      <button @click="pause">pause</button>
      <button v-if="isLastMusic" @click="setPrevMusic">
        <PrevSVG />
      </button>
      <button v-if="isFirstMusic" @click="setNextMusic">
        <NextSVG />
      </button>
      <div>
        <input
          v-model="activeMusic.time"
          type="range"
          min="0"
          :max="activeMusic.music.duration"
          @input="setVisibleTime"
          @click="setCurrentTime"
        />
      </div>
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
