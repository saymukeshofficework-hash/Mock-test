import type { SchoolDocument } from '../types/document'
import { uid } from '../utils/id'
import { readJSON, writeJSON } from './localStore'

const KEY = 'documents'

export function listDocuments(): SchoolDocument[] {
  return readJSON<SchoolDocument[]>(KEY, [])
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getDocument(id: string): SchoolDocument | undefined {
  return readJSON<SchoolDocument[]>(KEY, []).find((d) => d.id === id)
}

export function saveDocument(doc: SchoolDocument): SchoolDocument {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  const idx = all.findIndex((d) => d.id === doc.id)
  const updated = { ...doc, updatedAt: Date.now() }
  if (idx >= 0) all[idx] = updated
  else all.push(updated)
  writeJSON(KEY, all)
  return updated
}

export function deleteDocument(id: string): void {
  const all = readJSON<SchoolDocument[]>(KEY, [])
  writeJSON(
    KEY,
    all.filter((d) => d.id !== id),
  )
}

export function duplicateDocument(id: string): SchoolDocument | undefined {
  const doc = getDocument(id)
  if (!doc) return undefined
  const now = Date.now()
  const copy: SchoolDocument = {
    ...doc,
    id: uid('doc'),
    name: `${doc.name} (प्रतिलिपि)`,
    createdAt: now,
    updatedAt: now,
    isTemplate: false,
  }
  return saveDocument(copy)
}

export function renameDocument(id: string, name: string): void {
  const doc = getDocument(id)
  if (!doc) return
  saveDocument({ ...doc, name })
}
