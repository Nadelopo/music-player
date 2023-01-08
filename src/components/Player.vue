<script setup lang="ts">
import { getMusics } from '@/firebase'
import { computed, onBeforeMount, watch } from 'vue'
import { $ref } from 'vue/macros'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'
import PlaySVG from '@/assets/icons/play.svg?component'
import PauseSVG from '@/assets/icons/pause.svg?component'
import VolumeSVG from '@/assets/icons/volume.svg?component'
import ReplaySVG from '@/assets/icons/replay.svg?component'
import Input from './UI/InputRange.vue'
import { getMinutesAndSeconds } from '@/utils/getMinutesAndSeconds'
import { modifiedSeconds } from '@/utils/modifiedSeconds'
import type { Imusics, IactiveMusic } from '@/types/Player'

export interface IcurrentTime {
  minutes: number
  seconds: number
}
// eslint-disable-next-line
const { log } = console

const setTitlePage = () => {
  if (activeMusic && currentTime) {
    document.title = `${activeMusic.title} - ${
      currentTime.minutes
    }:${modifiedSeconds(currentTime.seconds)}`
  }
}

const setVolume = () => {
  if (activeMusic) {
    activeMusic.music.volume = activeMusic.volume
  }
}

let unSortMusics = $ref<Imusics[]>([])
const musics = computed<Imusics[]>(() =>
  [...unSortMusics].sort((a, b) => a.id.localeCompare(b.id))
)
let activeMusic = $ref<IactiveMusic | null>(null)
let currentTime = $ref<IcurrentTime | null>(null)
let isChangeTime = $ref(true)
let isReplay = $ref(false)
let interval = $ref(0)

watch(
  () => activeMusic?.music,
  (cur) => {
    if (cur) setTitlePage()
  }
)

onBeforeMount(async () => {
  const setMountedValues = () => {
    if (activeMusic) {
      activeMusic.music.currentTime = activeMusic.time
      const { minutes, seconds } = getMinutesAndSeconds(
        activeMusic.music.currentTime
      )
      currentTime = { minutes, seconds }
    }
    setVolume()
  }

  let items = await getMusics()
  items.forEach(async (item, index) => {
    const audio = new Audio(item.src)
    audio.oncanplay = () => {
      const music: Imusics = {
        id: item.id,
        title: item.title,
        author: item.author,
        src: item.src,
        minutes: Math.floor(audio.duration / 60),
        seconds: Math.floor(audio.duration % 60),
        volume: 0.3,
        time: 0
      }

      if (localStorage.getItem('activeMusic')) {
        const pars = JSON.parse(localStorage.getItem('activeMusic') || '')
        activeMusic = { ...pars, music: new Audio(pars.musicSrc) }
        setMountedValues()
      } else {
        activeMusic = { ...music, music: audio }
        if (!index) {
          setMountedValues()
        }
      }
      unSortMusics.push(music)
    }
  })
})

const isLastMusic = computed(() => {
  let value = false
  if (activeMusic) {
    value = activeMusic.id !== musics.value[0].id
  }
  return value
})

const isFirstMusic = computed(() => {
  let value = false
  if (activeMusic) {
    value = activeMusic.id !== musics.value[musics.value.length - 1].id
  }
  return value
})

const resetMusicTime = () => {
  if (activeMusic) {
    activeMusic.music.currentTime = 0
    activeMusic.time = 0
    const { minutes, seconds } = getMinutesAndSeconds(
      activeMusic.music.currentTime
    )
    currentTime = { minutes, seconds }
  }
  pause()
}

const play = () => {
  activeMusic?.music.play()
  interval = window.setInterval(() => {
    if (activeMusic) {
      if (isChangeTime) {
        const { minutes, seconds } = getMinutesAndSeconds(
          activeMusic.music.currentTime
        )
        currentTime = { minutes, seconds }
        activeMusic.time++
      }
      if (activeMusic.music.currentTime >= activeMusic.music.duration) {
        clearInterval(interval)
        if (isReplay) {
          resetMusicTime()
          play()
        } else {
          setNextMusic()
        }
      }
    }
    setTitlePage()
  }, 1000)
}

const pause = () => {
  activeMusic?.music.pause()
  clearInterval(interval)
  interval = 0
}

const setNextMusic = () => {
  if (isLastMusic.value) return
  resetMusicTime()
  for (let i = 0; i < musics.value.length; i++) {
    if (activeMusic && musics.value[i].id === activeMusic.id) {
      activeMusic = {
        ...musics.value[i + 1],
        music: new Audio(musics.value[i + 1].src)
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
    if (activeMusic && musics.value[i].id === activeMusic.id) {
      activeMusic = {
        ...musics.value[i - 1],
        music: new Audio(musics.value[i - 1].src)
      }
      break
    }
  }
  play()
  setVolume()
}

const setVisibleTime = () => {
  if (activeMusic) {
    isChangeTime = false
    const { minutes, seconds } = getMinutesAndSeconds(activeMusic.time)
    currentTime = { minutes, seconds }
  }
}

const setCurrentTime = () => {
  if (activeMusic) {
    isChangeTime = true
    activeMusic.music.currentTime = activeMusic.time
    const { minutes, seconds } = getMinutesAndSeconds(
      activeMusic.music.currentTime
    )
    currentTime = { minutes, seconds }
  }
}

const allTimeMusic = computed(() => {
  let time = ''
  if (activeMusic) {
    time = [activeMusic?.minutes, modifiedSeconds(activeMusic.seconds)].join(
      ':'
    )
  }
  return time
})

const durationMount = computed(() => {
  let dur = 0
  if (activeMusic) {
    dur = activeMusic.minutes * 60 + activeMusic.seconds
  }
  return dur
})

let passDuration = computed(() => {
  let time = ''
  if (activeMusic) {
    let duration
    if (isNaN(activeMusic.music.duration)) {
      duration = durationMount.value
    } else {
      duration = activeMusic.music.duration
    }
    time = (activeMusic.time * 100) / duration + '%'
  }
  return time
})

const passVolume = computed(() => {
  let time = ''
  if (activeMusic) {
    time = (activeMusic.volume * 100) / 1 + '%'
  }
  return time
})

watch(
  () => activeMusic,
  () => {
    if (activeMusic) {
      localStorage.setItem(
        'activeMusic',
        JSON.stringify({
          ...activeMusic,
          musicSrc: activeMusic.music.src
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
      <div>{{ activeMusic.title }}</div>
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
          <div class="flex items-center gap-6">
            <button @click="setNextMusic">
              <NextSVG />
            </button>
            <button @click="isReplay = !isReplay">
              <ReplaySVG :class="{ active: isReplay }" class="replay" />
            </button>
          </div>
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
    .replay
      &.active
        fill: #1db954
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
</style>
