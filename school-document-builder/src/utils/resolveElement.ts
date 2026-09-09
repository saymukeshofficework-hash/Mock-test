import type { DocumentElement } from '../types/document'
import { resolveVariables } from './variables'

export function resolveElementForDisplay(el: DocumentElement, ctx: Record<string, string>): DocumentElement {
  switch (el.type) {
    case 'heading':
    case 'paragraph':
      return { ...el, html: resolveVariables(el.html, ctx) }
    case 'keyvalue':
      return { ...el, value: resolveVariables(el.value, ctx) || ctx[el.label] || el.value }
    case 'signature':
      return {
        ...el,
        slots: el.slots.map((s) => ({
          ...s,
          name: resolveVariables(s.name, ctx),
          designation: resolveVariables(s.designation, ctx),
        })),
      }
    case 'table':
      return {
        ...el,
        table: {
          ...el.table,
          rows: el.table.rows.map((row) => ({
            ...row,
            cells: row.cells.map((cell) => ({ ...cell, html: resolveVariables(cell.html, ctx) })),
          })),
        },
      }
    default:
      return el
  }
}
