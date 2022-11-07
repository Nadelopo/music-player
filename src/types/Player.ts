export interface Imusics {
  name: string
  author: string
  src: string
  minutes: number
  seconds: number
  volume: number
  time: number
}

export type IactiveMusic = Omit<Imusics, 'src'> & { music: HTMLAudioElement }

export interface IcurrentTime {
  minutes: number
  seconds: number
}
