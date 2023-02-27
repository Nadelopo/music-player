<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/musicStore'
import MusicAnimation from '@/components/MusicAnimation.vue'
import PlaySVG from '@/assets/icons/play.svg?component'
import PauseSVG from '@/assets/icons/pause.svg?component'
import { formatTime } from '@/utils/formatTIme'

const { musics, activeMusic, isMusicOn } = storeToRefs(useMusicStore())
const { setSelectedMusic, pause } = useMusicStore()

const activeRow = ref<number | null>(null)

const musicPlay = (i: number) => {
  return (
    activeRow.value !== i &&
    isMusicOn.value &&
    activeMusic.value?.id === musics.value[i].id
  )
}

const musicPlayHover = (i: number) => {
  return (
    activeRow.value === i &&
    isMusicOn.value &&
    activeMusic.value?.id === musics.value[i].id
  )
}
</script>

<template>
  <div>
    <div class="root">
      <div class="list">
        <div
          v-for="(music, i) in musics"
          :key="music.id"
          class="row"
          @mouseover="activeRow = i"
          @mouseleave="activeRow = null"
        >
          <template v-if="musicPlay(i)">
            <MusicAnimation />
          </template>
          <template v-else-if="musicPlayHover(i)">
            <button @click="pause">
              <PauseSVG fill="#fff" />
            </button>
          </template>
          <template v-else-if="activeRow !== i">
            <div
              class="number"
              :class="{ active: activeMusic?.id === musics[i].id }"
            >
              {{ i + 1 }}
            </div>
          </template>
          <template v-else>
            <button @click="setSelectedMusic(music)">
              <PlaySVG fill="#fff" />
            </button>
          </template>
          <div class="info">
            <div
              class="title"
              :class="{ active: activeMusic?.id === musics[i].id }"
            >
              {{ music.title }}
            </div>
            <div class="author">{{ music.author }}</div>
          </div>
          <div class="time">
            {{ formatTime(music.duration) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">
.root
  padding: 40px 30px

.row
  color: #fff
  height: 56px
  display: grid
  grid-template-columns: 20px auto 1fr
  gap: 16px
  align-items: center
  border-radius: 4px
  padding: 0 20px
  &:hover
    background: #383838
  .number
    color: #b3b3b3
    justify-self: center
    &.active
      color: var(--color-second)
  .info
    .author
      font-size: 14px
      color: #b3b3b3
    .title
      &.active
        color: var(--color-second)
  .time
    justify-self: end
</style>
