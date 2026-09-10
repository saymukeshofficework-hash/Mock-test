import { DEFAULT_SCHOOL_SETTINGS, type SchoolSettings } from '../types/school'
import { readJSON, writeJSON } from './localStore'

const KEY = 'schoolSettings'

export function getSchoolSettings(): SchoolSettings {
  return { ...DEFAULT_SCHOOL_SETTINGS, ...readJSON<Partial<SchoolSettings>>(KEY, {}) }
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  writeJSON(KEY, settings)
}
