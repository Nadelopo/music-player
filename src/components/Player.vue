<script setup lang="ts">
import { watch, computed, onBeforeMount } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore, type Music } from '@/stores/musicStore'
import { localStorageGet, localStorageSet } from '@/utils/localStorage'
import { formatTime } from '@/utils/formatTIme'
import { getMusics } from '@/firebase'
import Input from './UI/InputRange.vue'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'
import PlaySVG from '@/assets/icons/play.svg?component'
import PauseSVG from '@/assets/icons/pause.svg?component'
import VolumeSVG from '@/assets/icons/volume.svg?component'
import ReplaySVG from '@/assets/icons/replay.svg?component'
import VolumeOffSVG from '@/assets/icons/volumeoff.svg?component'

interface MusicFromStorage extends Music {
  musicSrc: string
  music: {}
}

const { activeMusic, isMusicOn, isChangeTime, isReplay, unSortMusics } =
  storeToRefs(useMusicStore())
const { play, pause, setNextMusic, setPrevMusic } = useMusicStore()

addEventListener('keyup', (e) => {
  if (e.key === ' ') {
    if (isMusicOn.value) pause()
    else play()
  }
})

onBeforeMount(async () => {
  const items = await getMusics()
  items.forEach((item, i) => {
    const audio = new Audio(item.src)
    audio.oncanplay = () => {
      const music: Music = {
        id: item.id,
        title: item.title,
        author: item.author,
        src: item.src,
        duration: audio.duration,
        volume: 0.3,
        time: 0
      }
      if (!i) {
        if (localStorageGet('activeMusic')) {
          const parsed = localStorageGet<MusicFromStorage>('activeMusic')
          if (parsed) {
            activeMusic.value = { ...parsed, music: new Audio(parsed.musicSrc) }
            activeMusic.value.music.currentTime = activeMusic.value.time
            activeMusic.value.music.volume = activeMusic.value.volume
          }
        } else {
          activeMusic.value = { ...music, music: new Audio(item.src) }
          activeMusic.value.music.volume = activeMusic.value.volume
        }
      }
      unSortMusics.value.push(music)
    }
  })
})

const setVolume = (value: number) => {
  if (activeMusic.value) {
    activeMusic.value.music.volume = value
  }
}

const setCurrentTime = (value: number) => {
  if (activeMusic.value) {
    isChangeTime.value = false
    activeMusic.value.music.currentTime = value
  }
}

const volumeSwitch = () => {
  if (activeMusic.value) {
    if (activeMusic.value.volume) {
      localStorageSet('prevVolume', activeMusic.value.volume)
      activeMusic.value.volume = 0
      activeMusic.value.music.volume = 0
    } else {
      const previousVolume = localStorageGet<number>('prevVolume') ?? 0.3
      activeMusic.value.volume = previousVolume
      activeMusic.value.music.volume = previousVolume
    }
  }
}

let passDuration = computed(() => {
  let time = ''
  if (activeMusic.value) {
    time = (activeMusic.value.time * 100) / activeMusic.value.duration + '%'
  }
  return time
})

const passVolume = computed(() => {
  let volume = ''
  if (activeMusic.value) {
    volume = activeMusic.value.volume * 100 + '%'
  }
  return volume
})

watch(
  activeMusic,
  () => {
    if (activeMusic.value) {
      document.title = `${activeMusic.value.title} - ${formatTime(
        activeMusic.value.music.currentTime
      )}`
      localStorageSet('activeMusic', {
        ...activeMusic.value,
        musicSrc: activeMusic.value.music.src
      })
    }
  },
  { deep: true }
)
</script>

<template>
  <div v-if="activeMusic">
    <div class="player">
      <div class="first">
        <div>{{ activeMusic.title }}</div>
        <div>{{ activeMusic.author }}</div>
      </div>
      <div class="second">
        <div>
          <div class="player__controls">
            <div class="flex justify-end">
              <button @click="setPrevMusic">
                <PrevSVG />
              </button>
            </div>
            <div v-if="isMusicOn">
              <button class="player__on-of" @click="pause">
                <PauseSVG />
              </button>
            </div>
            <div v-else>
              <button class="player__on-of" @click="play">
                <PlaySVG />
              </button>
            </div>
            <div class="flex items-center gap-6">
              <button @click="setNextMusic">
                <NextSVG />
              </button>
              <button @click="isReplay = !isReplay">
                <ReplaySVG :class="{ active: isReplay }" class="replay" />
              </button>
            </div>
          </div>
          <div class="player__bar">
            <div>
              {{ formatTime(activeMusic.time) }}
            </div>
            <div class="w-full flex items-center">
              <Input
                v-model="activeMusic.time"
                class="w-full"
                :max="activeMusic.duration"
                :on-input="() => (isChangeTime = true)"
                :on-click="setCurrentTime"
                :pass-bar="passDuration"
              />
            </div>
            <div>{{ formatTime(activeMusic.duration) }}</div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-3 items-center">
        <VolumeSVG
          v-if="activeMusic.volume"
          class="cursor-pointer"
          @click="volumeSwitch"
        />
        <VolumeOffSVG v-else class="cursor-pointer" @click="volumeSwitch" />
        <Input
          v-model="activeMusic.volume"
          :step="0.01"
          :max="1"
          :on-input="setVolume"
          :pass-bar="passVolume"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.player
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
  .player__bar
    display: grid
    grid-template-columns: auto 1fr auto
    align-items: center
    gap: 20px
  .player__controls
    display: grid
    grid-template-columns: 1fr auto 1fr
    align-items: center
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
