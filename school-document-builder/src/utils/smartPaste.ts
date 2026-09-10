import type { SchoolDocument, DocumentElement, TableElement } from '../types/document'
import { newCell, newParagraph, newTableElement } from './factory'
import { applyPastedGrid, parseTabularPaste } from './tablePaste'

export interface SmartPasteResult {
  header?: DocumentHeaderPatch
  elements?: DocumentElement[]
  filledHeader: boolean
  filledMatter: boolean
  filledTableRows: number
}

type DocumentHeaderPatch = SchoolDocument['header']

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Plain pasted text -> safe HTML, turning line breaks into <br/> so multi-line blocks stay legible. */
function textToHtml(s: string): string {
  return escapeHtml(s).trim().split('\n').join('<br/>')
}

/** The document header is always a single line — join pasted header lines with ", " instead of <br/>. */
function headerLinesToHtml(s: string): string {
  const lines = s
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  return escapeHtml(lines.join(', '))
}

/**
 * Strips characters that a chat app's copy/paste sometimes sneaks in and that would
 * otherwise silently break tag matching: zero-width spaces/joiners, a BOM, non-breaking
 * spaces, and markdown bold wrapped directly around a [TAG].
 */
function normalizePasted(text: string): string {
  return text
    .replace(/[​‌‍﻿]/g, '')
    .replace(/ /g, ' ')
    .replace(/\*\*(\[[A-Za-zऀ-ॿ]+\])\*\*/g, '$1')
}

/** Matches a [TAG], tolerating an optional trailing colon (e.g. "[HEADER]:"). */
function tagPattern(names: string[]): string {
  return `\\[(?:${names.join('|')})\\]:?`
}

/**
 * If the same top-level tag (e.g. [HEADER]) appears a second time anywhere in the
 * text, the whole template was almost certainly pasted twice back-to-back (a clipboard
 * that accumulated two copies, or copying the same reply twice) rather than the user
 * intending a second [HEADER] section. Cut everything from that second occurrence
 * onward, keeping just the first copy.
 */
function truncateAtSecondOccurrence(text: string, names: string[]): string {
  const pattern = new RegExp(tagPattern(names), 'gi')
  const matches = [...text.matchAll(pattern)]
  return matches.length < 2 ? text : text.slice(0, matches[1].index)
}

/** Pulls the text under a [SECTION] marker, up to the next [MARKER] or end of the text. */
function extractSection(text: string, names: string[]): { value: string; matchEnd: number } | null {
  const pattern = new RegExp(
    `${tagPattern(names)}\\s*([\\s\\S]*?)(?=\\n\\s*\\[[A-Za-z\\u0900-\\u097F]+\\]:?|$)`,
    'i',
  )
  const match = pattern.exec(text)
  if (!match) return null
  const value = match[1]?.trim()
  return value ? { value, matchEnd: match.index + match[0].length } : null
}

function stripLeadingTag(s: string, names: string[]): string {
  const re = new RegExp(`^\\s*${tagPattern(names)}\\s*`, 'i')
  return s.replace(re, '')
}

/**
 * If the whole flowing body was accidentally pasted twice back-to-back (a mobile
 * clipboard/paste quirk, or clicking "सब भरें" twice before the box updated), the
 * chunk list is an exact repeat of itself. Detect that and keep only the first copy.
 */
function dropDuplicatedTail(chunks: string[]): string[] {
  const n = chunks.length
  if (n < 2 || n % 2 !== 0) return chunks
  const half = n / 2
  const isDuplicate = chunks.slice(0, half).every((c, i) => c === chunks[half + i])
  return isDuplicate ? chunks.slice(0, half) : chunks
}

/**
 * Parses a single pasted block with a [HEADER] section and a flowing body (optionally
 * under a [MATTER] tag) made of blank-line-separated paragraphs. A [TABLE] tag can
 * appear as its own paragraph-like chunk anywhere in that flow — its own line, a blank
 * line, then tab/comma-separated rows — and becomes a table at that exact position,
 * so a table can sit in the middle of a letter between two paragraphs, matching how a
 * real office letter reads. [TABLE] column headers are matched against an existing
 * table's headers by text; a table is created (sized to the pasted columns) if the
 * document doesn't have one yet.
 */
export function applySmartPaste(doc: SchoolDocument, rawText: string): SmartPasteResult {
  const result: SmartPasteResult = { filledHeader: false, filledMatter: false, filledTableRows: 0 }
  let text = normalizePasted(rawText)
  text = truncateAtSecondOccurrence(text, ['HEADER', 'हेडर'])
  text = truncateAtSecondOccurrence(text, ['MATTER', 'विषय', 'BODY', 'मैटर'])

  const header = extractSection(text, ['HEADER', 'हेडर'])
  let body = text
  if (header) {
    result.header = { ...doc.header, html: headerLinesToHtml(header.value) }
    result.filledHeader = true
    body = text.slice(header.matchEnd)
  }
  body = stripLeadingTag(body.trim(), ['MATTER', 'विषय', 'BODY', 'मैटर'])
  if (!body.trim()) return result

  const chunks = dropDuplicatedTail(
    body
      .split(/\n\s*\n/)
      .map((c) => c.trim())
      .filter(Boolean),
  )
  if (chunks.length === 0) return result

  const existingTableIdx = doc.elements.findIndex((e) => e.type === 'table')
  const existingTable = existingTableIdx >= 0 ? (doc.elements[existingTableIdx] as TableElement) : undefined
  let tableUsed = false
  let tableRows = 0

  const bodyElements: DocumentElement[] = chunks.map((chunk) => {
    const tableMatch = new RegExp(`^${tagPattern(['TABLE', 'तालिका'])}\\s*([\\s\\S]*)$`, 'i').exec(chunk)
    if (!tableMatch) return newParagraph(textToHtml(chunk))

    const grid = parseTabularPaste(tableMatch[1])
    if (grid.length === 0) return newParagraph('')
    tableRows += grid.length - 1

    if (existingTable && !tableUsed) {
      tableUsed = true
      return { ...existingTable, table: applyPastedGrid(existingTable.table, grid, true) }
    }
    const cols = grid[0].length
    const el = newTableElement(1, cols)
    el.table.rows[0].cells = grid[0].map((h) => newCell(h, true))
    el.table = applyPastedGrid(el.table, grid, true)
    return el
  })

  result.filledMatter = bodyElements.some((e) => e.type === 'paragraph')
  result.filledTableRows = tableRows

  // Replace every existing paragraph/table with the new flowing body, inserted where
  // the first one used to be (or appended at the end if the document had neither yet).
  let inserted = false
  const nextElements: DocumentElement[] = []
  doc.elements.forEach((e) => {
    if (e.type === 'paragraph' || e.type === 'table') {
      if (!inserted) {
        nextElements.push(...bodyElements)
        inserted = true
      }
    } else {
      nextElements.push(e)
    }
  })
  if (!inserted) nextElements.push(...bodyElements)
  result.elements = nextElements

  return result
}
