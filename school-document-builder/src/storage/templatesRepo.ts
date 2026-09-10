import type { SchoolDocument } from '../types/document'
import { uid } from '../utils/id'
import { readJSON, writeJSON } from './localStore'

const KEY = 'userTemplates'

export function listUserTemplates(): SchoolDocument[] {
  return readJSON<SchoolDocument[]>(KEY, []).sort((a, b) => b.updatedAt - a.updatedAt)
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

export function deleteUserTemplate(id: string): void {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  writeJSON(
    KEY,
    all.filter((d) => d.id !== id),
  )
}
