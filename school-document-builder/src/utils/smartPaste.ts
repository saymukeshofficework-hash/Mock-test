import type { SchoolDocument, DocumentElement, TableElement, DocumentHeader } from '../types/document'
import { newCell, newParagraph, newTableElement } from './factory'
import { applyPastedGrid, parseTabularPaste } from './tablePaste'

export interface SmartPasteResult {
  header?: DocumentHeader
  elements?: DocumentElement[]
  filledHeader: boolean
  filledMatter: boolean
  filledTableRows: number
}

/** Pulls the text under a [SECTION] marker, up to the next [MARKER] or end of the text. */
function extractSection(text: string, names: string[]): string | null {
  const pattern = new RegExp(
    `\\[(?:${names.join('|')})\\]\\s*([\\s\\S]*?)(?=\\n\\s*\\[[A-Za-z\\u0900-\\u097F]+\\]|$)`,
    'i',
  )
  const match = pattern.exec(text)
  const value = match?.[1]?.trim()
  return value ? value : null
}

/**
 * Parses a single pasted block with [HEADER] / [MATTER] / [TABLE] sections and
 * distributes each to the right place: header text, the document's first paragraph
 * (created if none exists), and its first table (created, sized to the pasted data's
 * column count, if none exists).
 */
export function applySmartPaste(doc: SchoolDocument, text: string): SmartPasteResult {
  const result: SmartPasteResult = { filledHeader: false, filledMatter: false, filledTableRows: 0 }
  let elements = doc.elements

  const headerText = extractSection(text, ['HEADER', 'हेडर'])
  if (headerText) {
    result.header = { ...doc.header, html: headerText }
    result.filledHeader = true
  }

  const matterText = extractSection(text, ['MATTER', 'विषय', 'BODY', 'मैटर'])
  if (matterText) {
    const idx = elements.findIndex((e) => e.type === 'paragraph')
    if (idx >= 0) {
      elements = elements.map((e, i) => (i === idx ? { ...e, html: matterText } : e))
    } else {
      elements = [...elements, newParagraph(matterText)]
    }
    result.filledMatter = true
  }

  const tableText = extractSection(text, ['TABLE', 'तालिका'])
  if (tableText) {
    const grid = parseTabularPaste(tableText)
    if (grid.length > 0) {
      const idx = elements.findIndex((e) => e.type === 'table')
      if (idx >= 0) {
        const el = elements[idx] as TableElement
        const updatedTable = applyPastedGrid(el.table, grid, true)
        elements = elements.map((e, i) => (i === idx ? ({ ...e, table: updatedTable } as TableElement) : e))
      } else {
        const cols = grid[0].length
        const newEl = newTableElement(1, cols)
        newEl.table.rows[0].cells = grid[0].map((h) => newCell(h, true))
        newEl.table = applyPastedGrid(newEl.table, grid, true)
        elements = [...elements, newEl]
      }
      result.filledTableRows = grid.length - 1
    }
  }

  if (elements !== doc.elements) result.elements = elements
  return result
}
