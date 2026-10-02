import { DEFAULT_DATA } from './constants'

const KEY = 'rc'

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const next = { ...structuredClone(DEFAULT_DATA), ...JSON.parse(raw) }
      if (next.country === 'UK') next.country = 'GB'
      return next
    }
  } catch {
    // ignore — fall back to defaults
  }
  return structuredClone(DEFAULT_DATA)
}

export function persistLocal(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // storage may be unavailable; app still works in memory
  }
}

export function clearData() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
  return structuredClone(DEFAULT_DATA)
}
