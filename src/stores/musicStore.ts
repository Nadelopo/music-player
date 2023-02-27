import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getMusics } from '@/firebase'
import { localStorageGet } from '@/utils/localStorage'

interface Imusics {
  id: string
  title: string
  author: string
  src: string
  duration: number
  volume: number
  time: number
}

type IactiveMusic = Omit<Imusics, 'src'> & { music: HTMLAudioElement }

interface IstorageGetMusic extends Imusics {
  musicSrc: string
  music: {}
}

export const useMusicStore = defineStore('music', () => {
  const unSortMusics = ref<Imusics[]>([])
  const activeMusic = ref<IactiveMusic | null>(null)
  const musics = computed<Imusics[]>(() =>
    [...unSortMusics.value].sort((a, b) => a.id.localeCompare(b.id))
  )
  const isMusicOn = ref(0)
  const isChangeTime = ref(false)
  const isReplay = ref(false)

  const setMusics = async () => {
    const items = await getMusics()
    items.forEach((item, i) => {
      const audio = new Audio(item.src)
      audio.oncanplay = () => {
        const music: Imusics = {
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
            const pars: IstorageGetMusic = localStorageGet('activeMusic')
            activeMusic.value = { ...pars, music: new Audio(pars.musicSrc) }
            activeMusic.value.music.currentTime = activeMusic.value.time

            activeMusic.value.music.volume = activeMusic.value.volume
          } else {
            activeMusic.value = { ...music, music: new Audio(item.src) }
            activeMusic.value.music.volume = activeMusic.value.volume
          }
        }
        unSortMusics.value.push(music)
      }
    })
  }

  const play = () => {
    activeMusic.value?.music.play()
    isMusicOn.value = window.setInterval(() => {
      if (activeMusic.value) {
        if (!isChangeTime.value) {
          activeMusic.value.time = activeMusic.value.music.currentTime
        }
        if (
          activeMusic.value.music.currentTime >=
          activeMusic.value.music.duration
        ) {
          clearInterval(isMusicOn.value)
          if (isReplay.value) {
            activeMusic.value.time = 0
            play()
          } else {
            if (activeMusic.value.id === musics.value.at(-1)?.id) {
              setSelectedMusic(musics.value[0])
            } else {
              setNextMusic()
            }
          }
        }
      }
    }, 1000)
  }

  const pause = () => {
    activeMusic.value?.music.pause()
    clearInterval(isMusicOn.value)
    isMusicOn.value = 0
  }

  const resetMusicTime = () => {
    if (activeMusic.value) {
      activeMusic.value.time = 0
    }
    pause()
  }

  const setNextMusic = () => {
    const isLastMusic = activeMusic.value?.id === musics.value.at(-1)?.id
    if (isLastMusic) return
    resetMusicTime()
    for (let i = 0; i < musics.value.length; i++) {
      if (activeMusic.value && musics.value[i].id === activeMusic.value.id) {
        activeMusic.value = {
          ...musics.value[i + 1],
          music: new Audio(musics.value[i + 1].src),
          volume: activeMusic.value.volume
        }
        activeMusic.value.music.volume = activeMusic.value.volume
        break
      }
    }
    play()
  }

  const setSelectedMusic = (music: Imusics) => {
    if (activeMusic.value?.id !== music.id) {
      resetMusicTime()
      activeMusic.value = { ...music, music: new Audio(music.src) }
      activeMusic.value.music.volume = activeMusic.value.volume
    }
    play()
  }

  setMusics()

  return {
    unSortMusics,
    setMusics,
    activeMusic,
    musics,
    play,
    pause,
    setSelectedMusic,
    isMusicOn,
    isChangeTime,
    isReplay,
    resetMusicTime,
    setNextMusic
  }
})
