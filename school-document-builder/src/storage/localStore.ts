const PREFIX = 'sdbs.v1.'

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (err) {
    console.error('स्टोरेज सहेजने में त्रुटि', err)
  }
}

export function removeKey(key: string): void {
  localStorage.removeItem(PREFIX + key)
}
