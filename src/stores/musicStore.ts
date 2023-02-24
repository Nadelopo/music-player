import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { getMusics } from '@/firebase'
import { localStorageGet } from '@/utils/localStorage'
import { getMinutesAndSeconds } from '@/utils/getMinutesAndSeconds'
import { modifiedSeconds } from '@/utils/modifiedSeconds'

interface Imusics {
  id: string
  title: string
  author: string
  src: string
  minutes: number
  seconds: number
  volume: number
  time: number
}

type IactiveMusic = Omit<Imusics, 'src'> & { music: HTMLAudioElement }

interface IstorageGetMusic extends Imusics {
  musicSrc: string
  music: {}
}

interface IcurrentTime {
  minutes: number
  seconds: number
}

export const useMusicStore = defineStore('music', () => {
  const unSortMusics = ref<Imusics[]>([])
  const activeMusic = ref<IactiveMusic | null>(null)
  const currentTime = ref<IcurrentTime | null>(null)
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
          minutes: Math.floor(audio.duration / 60),
          seconds: Math.floor(audio.duration % 60),
          volume: 0.3,
          time: 0
        }
        if (!i) {
          if (localStorageGet('activeMusic')) {
            const pars: IstorageGetMusic = localStorageGet('activeMusic')
            activeMusic.value = { ...pars, music: new Audio(pars.musicSrc) }
            activeMusic.value.music.currentTime = activeMusic.value.time
            const { minutes, seconds } = getMinutesAndSeconds(
              activeMusic.value.music.currentTime
            )
            currentTime.value = { minutes, seconds }
            activeMusic.value.music.volume = activeMusic.value.volume
          } else {
            activeMusic.value = { ...music, music: new Audio(item.src) }
            currentTime.value = { minutes: 0, seconds: 0 }
            activeMusic.value.music.volume = activeMusic.value.volume
          }
        }
        unSortMusics.value.push(music)
      }
    })
  }

  const setTitlePage = () => {
    if (activeMusic.value && currentTime.value) {
      document.title = `${activeMusic.value.title} - ${
        currentTime.value.minutes
      }:${modifiedSeconds(currentTime.value.seconds)}`
    }
  }

  const play = () => {
    activeMusic.value?.music.play()
    isMusicOn.value = window.setInterval(() => {
      if (activeMusic.value) {
        if (!isChangeTime.value) {
          const { minutes, seconds } = getMinutesAndSeconds(
            activeMusic.value.music.currentTime
          )
          currentTime.value = { minutes, seconds }
          activeMusic.value.time++
        }
        if (
          activeMusic.value.music.currentTime >=
          activeMusic.value.music.duration
        ) {
          clearInterval(isMusicOn.value)
          if (isReplay.value) {
            activeMusic.value.time = 0
            currentTime.value = { minutes: 0, seconds: 0 }
          } else {
            if (activeMusic.value.id === musics.value.at(-1)?.id) {
              setSelectedMusic(musics.value[0])
            } else {
              setNextMusic()
            }
          }
        }
      }
      setTitlePage()
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
      currentTime.value = { minutes: 0, seconds: 0 }
    }
    pause()
  }

  const setNextMusic = () => {
    if (isLastMusic.value) return
    resetMusicTime()
    for (let i = 0; i < musics.value.length; i++) {
      if (activeMusic.value && musics.value[i].id === activeMusic.value.id) {
        activeMusic.value = {
          ...musics.value[i + 1],
          music: new Audio(musics.value[i + 1].src)
        }
        break
      }
    }
    play()
    if (activeMusic.value) {
      activeMusic.value.music.volume = activeMusic.value.volume
    }
  }

  const setSelectedMusic = (music: Imusics) => {
    if (activeMusic.value?.id !== music.id) {
      resetMusicTime()
      activeMusic.value = { ...music, music: new Audio(music.src) }
      activeMusic.value.music.volume = activeMusic.value.volume
    }
    play()
  }

  const isLastMusic = computed(() => {
    let value = false
    if (activeMusic.value) {
      value = activeMusic.value.id === musics.value.at(-1)?.id
    }
    return value
  })

  const onMusicReady = watch(
    () => activeMusic.value?.music,
    (cur) => {
      if (cur) {
        setTitlePage()
        onMusicReady()
      }
    }
  )

  return {
    unSortMusics,
    setMusics,
    activeMusic,
    currentTime,
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
