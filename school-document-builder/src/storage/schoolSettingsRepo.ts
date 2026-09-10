import { DEFAULT_SCHOOL_SETTINGS, type SchoolSettings } from '../types/school'
import { readJSON, writeJSON } from './localStore'

const KEY = 'schoolSettings'

// Old real school identity that used to ship as the default, before it was replaced with a
// fictional placeholder. A browser that saved settings before that change still has these
// values in localStorage; detect and reset them so the real identity doesn't linger.
const REAL_IDENTITY_MARKERS = ['भरमीला', 'भरमिला', 'बिजौरी', 'उमरिया', 'मानपुर', 'मध्य प्रदेश']

function hasRealIdentity(settings: Partial<SchoolSettings>): boolean {
  const fields = [settings.school_name, settings.education_center, settings.district, settings.state, settings.block, settings.default_place]
  return fields.some((v) => typeof v === 'string' && REAL_IDENTITY_MARKERS.some((marker) => v.includes(marker)))
}

export function getSchoolSettings(): SchoolSettings {
  const saved = readJSON<Partial<SchoolSettings>>(KEY, {})
  if (hasRealIdentity(saved)) {
    writeJSON(KEY, DEFAULT_SCHOOL_SETTINGS)
    return { ...DEFAULT_SCHOOL_SETTINGS }
  }
  return { ...DEFAULT_SCHOOL_SETTINGS, ...saved }
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  writeJSON(KEY, settings)
}
