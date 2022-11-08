export interface Imusics {
  id: string
  title: string
  author: string
  src: string
  minutes: number
  seconds: number
  volume: number
  time: number
}

export type IactiveMusic = Omit<Imusics, 'src'> & { music: HTMLAudioElement }
