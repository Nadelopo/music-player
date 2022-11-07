export const modifiedSeconds = (seconds: number | string) =>
  seconds < 10 ? `0${seconds}` : String(seconds)
