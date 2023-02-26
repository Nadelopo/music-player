export const formatTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  seconds = Math.floor(seconds % 60)
  return minutes + (seconds >= 10 ? `:${seconds}` : `:0${seconds}`)
}
