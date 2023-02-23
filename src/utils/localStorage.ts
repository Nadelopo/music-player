export const localStorageSet = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const localStorageGet = (key: string) => {
  return JSON.parse(localStorage.getItem(key) || '')
}
