export const getMinutesAndSeconds = (musicTime: number) => {
  const minutes = Math.floor(musicTime / 60)
  const seconds = Math.floor(musicTime % 60)
  return { minutes, seconds }
}
