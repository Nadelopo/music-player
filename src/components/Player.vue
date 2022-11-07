<script setup lang="ts">
import { storage } from '@/firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { computed, onBeforeMount, ref, watch } from 'vue'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'
import PlaySVG from '@/assets/icons/play.svg?component'
import PauseSVG from '@/assets/icons/pause.svg?component'
import VolumeSVG from '@/assets/icons/volume.svg?component'
import Input from './UI/InputRange.vue'

interface Imusics {
  name: string
  author: string
  src: string
  minutes: number
  seconds: number
  volume: number
  time: number
}

type IactiveMusic = Omit<Imusics, 'src'> & { music: HTMLAudioElement }

interface IcurrentTime {
  minutes: number
  seconds: number
}

const modifiedSeconds = (seconds: number) =>
  seconds < 10 ? `0${seconds}` : String(seconds)

const setTitlePage = () => {
  if (activeMusic.value && currentTime.value) {
    document.title = `${activeMusic.value.name} - ${
      currentTime.value.minutes
    }:${modifiedSeconds(currentTime.value.seconds)}`
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
const activeMusic = ref<IactiveMusic | null>(null)
const currentTime = ref<IcurrentTime | null>(null)
const isChangeTime = ref(true)

watch(
  () => activeMusic.value?.music,
  (cur) => {
    if (cur) setTitlePage()
  }
)

onBeforeMount(async () => {
  const gsReference = StorerRef(storage, 'gs://music-player-b46c4.appspot.com')
  const { items } = await listAll(gsReference)

  const setMountedValues = () => {
    if (activeMusic.value) {
      activeMusic.value.music.currentTime = activeMusic.value.time
      const { minutes, seconds } = getMinutesAndSeconds(
        activeMusic.value.music.currentTime
      )
      currentTime.value = { minutes, seconds }
    }
    setVolume()
  }

  items.forEach(async (itemRef, index) => {
    const url = await getDownloadURL(StorerRef(storage, itemRef.name))
    const audio = new Audio(url)
    audio.oncanplay = () => {
      const music: Imusics = {
        name: itemRef.name.split('-')[0],
        author: itemRef.name.split('-')[1].split('.')[0],
        src: url,
        minutes: Math.floor(audio.duration / 60),
        seconds: Math.floor(audio.duration % 60),
        volume: 0.3,
        time: 0,
      }

      if (localStorage.getItem('activeMusic')) {
        const pars = JSON.parse(localStorage.getItem('activeMusic') || '')
        activeMusic.value = { ...pars, music: new Audio(pars.musicSrc) }
        setMountedValues()
      } else {
        activeMusic.value = { ...music, music: new Audio(music.src) }
        if (!index) {
          setMountedValues()
        }
      }

      unSortMusics.value.push(music)
    }
  })
})

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
  interval.value = 0
}

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
  if (isLastMusic.value) return
  resetMusicTime()
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = {
        ...musics.value[i + 1],
        music: new Audio(musics.value[i + 1].src),
      }
      break
    }
  }
  play()
  setVolume()
}

const setPrevMusic = () => {
  resetMusicTime()
  if (isFirstMusic.value) {
    play()
    return
  }
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic.value && musics.value[i].name === activeMusic.value.name) {
      activeMusic.value = {
        ...musics.value[i - 1],
        music: new Audio(musics.value[i - 1].src),
      }
      break
    }
  }
  play()
  setVolume()
}

const interval = ref(0)

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

const allTimeMusic = computed(() => {
  let time = ''
  if (activeMusic.value) {
    time = `${activeMusic.value?.minutes}:${modifiedSeconds(
      activeMusic.value.seconds
    )}`
  }
  return time
})

const durationMount = computed(() => {
  let dur = 0
  if (activeMusic.value) {
    dur = activeMusic.value.minutes * 60 + activeMusic.value.seconds
  }
  return dur
})

let passDuration = computed(() => {
  let time = ''
  if (activeMusic.value) {
    let duration
    if (isNaN(activeMusic.value.music.duration)) {
      duration = durationMount.value
    } else {
      duration = activeMusic.value.music.duration
    }
    time = (activeMusic.value.time * 100) / duration + '%'
  }
  return time
})

const passVolume = computed(() => {
  let time = ''
  if (activeMusic.value) {
    time = (activeMusic.value.volume * 100) / 1 + '%'
  }
  return time
})

watch(
  activeMusic,
  () => {
    if (activeMusic.value) {
      localStorage.setItem(
        'activeMusic',
        JSON.stringify({
          ...activeMusic.value,
          musicSrc: activeMusic.value.music.src,
        })
      )
    }
  },
  { deep: true }
)
</script>

<template>
  <div v-if="activeMusic" class="root">
    <div class="first">
      <div>{{ activeMusic.name }}</div>
      <div>{{ activeMusic.author }}</div>
    </div>
    <div class="second">
      <div>
        <div class="player__controls">
          <button @click="setPrevMusic">
            <PrevSVG />
          </button>
          <button v-if="interval" class="player__on-of" @click="pause">
            <PauseSVG />
          </button>
          <button v-else class="player__on-of" @click="play">
            <PlaySVG />
          </button>
          <button @click="setNextMusic">
            <NextSVG />
          </button>
        </div>
        <div class="flex w-full gap-6">
          <div v-if="currentTime">
            {{ currentTime.minutes }}:{{ modifiedSeconds(currentTime.seconds) }}
          </div>
          <div class="w-full flex items-center">
            <Input
              v-model="activeMusic.time"
              class="w-full"
              :max="durationMount"
              :on-input="setVisibleTime"
              :on-click="setCurrentTime"
              :pass-bar="passDuration"
            />
          </div>
          <div>{{ allTimeMusic }}</div>
        </div>
      </div>
    </div>
    <div class="flex justify-end gap-3 items-center">
      <VolumeSVG />
      <Input
        v-model="activeMusic.volume"
        :step="0.01"
        :max="1"
        :on-input="setVolume"
        :pass-bar="passVolume"
      />
    </div>
  </div>
</template>

<style scoped lang="sass">
.root
  display: grid
  grid-template-columns: repeat(3, 1fr)
  align-items: center
  background: #181818
  color: #fff
  padding: 17px 16px
  svg
    fill: #bababa


.second
  text-align: center
  audio
    width: 100%
    height: 40px
    &:focus-visible
      outline: none
  .player__controls
    display: flex
    justify-content: center
    gap: 20px
    margin-bottom: 10px
    svg
      fill: #bababa
      transition: .1s
      &:hover
        fill: #fff
    .player__on-of
      display: flex
      justify-content: center
      align-items: center
      width: 32px
      height: 32px
      background: #fff
      border-radius: 50px
      transition: .2s
      svg
        fill: #000
      &:hover
        transform: scale(1.05)


.player__buttons
  background: none
  outline: none
  border: none
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
