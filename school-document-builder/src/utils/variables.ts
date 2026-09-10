import type { SchoolSettings } from '../types/school'
import type { SchoolDocument } from '../types/document'
import { todayFormatted } from './date'

export interface VariableDef {
  key: string
  label: string
}

export const VARIABLE_DEFS: VariableDef[] = [
  { key: 'school_name', label: 'विद्यालय का नाम' },
  { key: 'education_center', label: 'शिक्षा केंद्र' },
  { key: 'district', label: 'जिला' },
  { key: 'state', label: 'राज्य' },
  { key: 'block', label: 'विकासखंड' },
  { key: 'udise_code', label: 'यू-डाइस कोड' },
  { key: 'mobile', label: 'मोबाइल नंबर' },
  { key: 'principal_name', label: 'प्रधानाध्यापक का नाम' },
  { key: 'teacher_name', label: 'शिक्षक का नाम' },
  { key: 'date', label: 'आज की दिनांक' },
  { key: 'place', label: 'स्थान' },
  { key: 'document_no', label: 'क्रमांक' },
  { key: 'student_name', label: 'विद्यार्थी का नाम' },
  { key: 'class', label: 'कक्षा' },
  { key: 'subject', label: 'विषय' },
]

export function buildVariableContext(
  school: SchoolSettings,
  doc: Pick<SchoolDocument, 'fields'>,
): Record<string, string> {
  return {
    school_name: school.school_name,
    education_center: school.education_center,
    district: school.district,
    state: school.state,
    block: school.block,
    udise_code: school.udise_code,
    mobile: school.mobile,
    principal_name: school.principal_name,
    teacher_name: school.teacher_name,
    date: todayFormatted(school.date_format),
    place: school.default_place,
    document_no: '',
    student_name: '',
    class: '',
    subject: '',
    ...doc.fields,
  }
}

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') {
    out.push(value)
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out))
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out))
  }
}

/** Scans a document (header + all elements) for {{variable}} tokens actually used in it. */
export function extractUsedVariables(doc: { header: { html: string }; elements: unknown }): string[] {
  const strings: string[] = [doc.header.html]
  collectStrings(doc.elements, strings)
  const keys = new Set<string>()
  strings.forEach((s) => {
    const matches = s.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)
    for (const m of matches) keys.add(m[1])
  })
  return Array.from(keys)
}

function normalizeKey(raw: string): string {
  return raw
    .trim()
    .replace(/^\{\{|\}\}$/g, '')
    .replace(/[:：=-]+$/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
}

/**
 * Parses pasted data (e.g. copied from a two-column Excel/Sheets range, or typed as
 * "key: value" lines) into a map of variable key -> value, matching each line's key
 * against known variable keys or their Hindi labels. Unmatched lines are ignored.
 */
export function parseFieldPaste(text: string): Record<string, string> {
  const result: Record<string, string> = {}
  const byNormalizedLabel = new Map(VARIABLE_DEFS.map((v) => [normalizeKey(v.label), v.key]))
  const knownKeys = new Set(VARIABLE_DEFS.map((v) => v.key))

  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      // Prefer a tab (two Excel/Sheets columns pasted as-is), then common label/value separators.
      const delimiter = line.includes('\t') ? '\t' : /:|=| - /.exec(line)?.[0]
      if (!delimiter) return
      const idx = line.indexOf(delimiter)
      const rawKey = line.slice(0, idx)
      const rawValue = line.slice(idx + delimiter.length)
      if (!rawValue.trim()) return

      const key = normalizeKey(rawKey)
      const matchedKey = knownKeys.has(key) ? key : byNormalizedLabel.get(key)
      if (matchedKey) result[matchedKey] = rawValue.trim()
    })

  return result
}

export function resolveVariables(text: string, context: Record<string, string>): string {
  if (!text) return text
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    const val = context[key]
    return val !== undefined && val !== '' ? val : match
  })
}
