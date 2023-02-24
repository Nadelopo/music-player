<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMusicStore } from '@/stores/musicStore'
import { modifiedSeconds } from '@/utils/modifiedSeconds'
import PlaySVG from '@/assets/icons/play.svg?component'
import MusicAnimation from '@/components/MusicAnimation.vue'

const { musics, activeMusic, isMusicOn } = storeToRefs(useMusicStore())
const { setSelectedMusic } = useMusicStore()

const activeRow = ref<number | null>(null)
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
          <div class="number">
            <template v-if="activeRow !== i">
              {{ i + 1 }}
            </template>
            <template v-else-if="isMusicOn && activeMusic?.id === musics[i].id">
              <MusicAnimation />
            </template>
            <template v-else>
              <button @click="setSelectedMusic(music)">
                <PlaySVG fill="#fff" />
              </button>
            </template>
          </div>
          <div class="info">
            <div class="title">{{ music.title }}</div>
            <div class="author">{{ music.author }}</div>
          </div>
          <div class="time">
            {{ music.minutes }}:{{ modifiedSeconds(music.seconds) }}
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
  .info
    .author
      font-size: 14px
      color: #b3b3b3
  .time
    justify-self: end
</style>
