import type { TableData } from '../types/document'
import { addRow, updateCell } from './tableOps'
import { stripHtml } from './formulas'

/** Splits pasted tabular text (tab-separated from Excel/Sheets, or comma-separated) into a grid of cells. */
export function parseTabularPaste(text: string): string[][] {
  return text
    .replace(/\r/g, '')
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      if (line.includes('\t')) return line.split('\t').map((c) => c.trim())
      if (line.includes(',')) return line.split(',').map((c) => c.trim())
      return line.split(/\s{2,}/).map((c) => c.trim())
    })
}

/**
 * Fills a table from a pasted grid. When hasHeader is true, the first pasted row is
 * matched against the table's own header row by text (so pasted columns don't need to
 * be in the same order as the table's columns) — falling back to positional order if
 * no header names match at all. Data fills starting at the table's first non-header,
 * non-total row, adding rows as needed (inserted before a trailing total row, if any).
 */
export function applyPastedGrid(table: TableData, grid: string[][], hasHeader: boolean): TableData {
  if (grid.length === 0) return table

  let dataRows = grid
  let colOrder: number[] | null = null

  if (hasHeader) {
    const headerRow = grid[0]
    dataRows = grid.slice(1)
    const tableHeaderRowIndex = table.rows.findIndex((r) => r.isHeader)
    if (tableHeaderRowIndex >= 0) {
      const tableHeaderCells = table.rows[tableHeaderRowIndex].cells
      const mapped = headerRow.map((h) => {
        const norm = stripHtml(h).trim().toLowerCase()
        if (!norm) return -1
        return tableHeaderCells.findIndex((c) => stripHtml(c.html).trim().toLowerCase() === norm)
      })
      if (mapped.some((i) => i >= 0)) colOrder = mapped
    }
  }

  if (dataRows.length === 0) return table

  let result = table
  let cursor = result.rows.findIndex((r) => !r.isHeader && !r.isTotalRow)
  if (cursor < 0) cursor = result.rows.length

  dataRows.forEach((rowValues, i) => {
    const rowIndex = cursor + i
    if (rowIndex >= result.rows.length || result.rows[rowIndex].isTotalRow) {
      const totalIdx = result.rows.findIndex((r) => r.isTotalRow)
      result = addRow(result, totalIdx >= 0 ? totalIdx : result.rows.length)
    }
    rowValues.forEach((val, pastedColIdx) => {
      const targetCol = colOrder ? colOrder[pastedColIdx] : pastedColIdx
      if (targetCol == null || targetCol < 0 || targetCol >= result.columns.length) return
      const cell = result.rows[rowIndex]?.cells[targetCol]
      if (!cell || cell.merged) return
      result = updateCell(result, rowIndex, targetCol, { html: val })
    })
  })

  return result
}
