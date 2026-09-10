import type { SchoolDocument } from '../types/document'
import { uid } from '../utils/id'
import { readJSON, writeJSON } from './localStore'

const KEY = 'userTemplates'

/** Strips one or more trailing " (कॉपी)" suffixes, so copying a copy never compounds the name. */
function stripCopySuffix(name: string): string {
  return name.replace(/(\s*\(कॉपी\))+$/, '')
}

export function listUserTemplates(): SchoolDocument[] {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  // One-time cleanup for names that already piled up "(कॉपी) (कॉपी) ..." before this fix.
  let changed = false
  const normalized = all.map((t) => {
    const clean = `${stripCopySuffix(t.name)} (कॉपी)`
    if (t.name.includes('(कॉपी) (कॉपी)') && t.name !== clean) {
      changed = true
      return { ...t, name: clean }
    }
    return t
  })
  if (changed) writeJSON(KEY, normalized)
  return normalized.sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getUserTemplate(id: string): SchoolDocument | undefined {
  return readJSON<SchoolDocument[]>(KEY, []).find((d) => d.id === id)
}

export function saveAsTemplate(doc: SchoolDocument, name: string, description: string): SchoolDocument {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  const now = Date.now()
  const template: SchoolDocument = {
    ...doc,
    id: uid('tpl'),
    name,
    templateDescription: description,
    isTemplate: true,
    createdAt: now,
    updatedAt: now,
  }
  all.push(template)
  writeJSON(KEY, all)
  return template
}

export function duplicateUserTemplate(id: string): SchoolDocument | undefined {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  const source = all.find((d) => d.id === id)
  if (!source) return undefined
  const now = Date.now()
  const copy: SchoolDocument = {
    ...source,
    id: uid('tpl'),
    name: `${stripCopySuffix(source.name)} (कॉपी)`,
    createdAt: now,
    updatedAt: now,
  }
  all.push(copy)
  writeJSON(KEY, all)
  return copy
}

export function deleteUserTemplate(id: string): void {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  writeJSON(
    KEY,
    all.filter((d) => d.id !== id),
  )
}
