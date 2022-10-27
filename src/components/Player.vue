<script setup lang="ts">
import { storage } from '@/firebase'
import { ref as StorerRef, listAll, getDownloadURL } from 'firebase/storage'
import { computed, onBeforeMount, ref } from 'vue'
import PrevSVG from '@/assets/icons/prev.svg?component'
import NextSVG from '@/assets/icons/next.svg?component'

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

const indexMusic = ref(0)
const preventMusic = () => {
  indexMusic.value =
    musics.value.findIndex((el) => el.src === activeMusic.value.src) - 1
  activeMusic.value = musics.value[indexMusic.value]
}

const nextMusic = () => {
  indexMusic.value =
    musics.value.findIndex((el) => el.src === activeMusic.value.src) + 1
  activeMusic.value = musics.value[indexMusic.value]
}

const lastMusic = computed(() => indexMusic.value === musics.value.length - 1)
</script>

<template>
  <div>
    <div class="wrapper">
      <div>
        <button
          :disabled="!indexMusic"
          class="player__buttons"
          tabindex="0"
          @click="preventMusic"
        >
          <PrevSVG />
        </button>
      </div>
      <audio v-if="activeMusic" controls :src="activeMusic.src" />

      <div>
        <button
          :disabled="lastMusic"
          class="player__buttons"
          tabindex="0"
          @click="nextMusic"
        >
          <NextSVG />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="sass">

.wrapper
  display: flex
  justify-content: center
  align-items: center
  audio
    height: 40px

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
</style>
