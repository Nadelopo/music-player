export const modifiedSeconds = (seconds: number) =>
  seconds < 10 ? `0${seconds}` : String(seconds)
