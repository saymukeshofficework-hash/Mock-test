import type { TableData } from '../types/document'

function colLetterToIndex(letters: string): number {
  let n = 0
  for (const ch of letters.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64)
  }
  return n - 1
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()
}

function cellNumericValue(table: TableData, r: number, c: number, depth = 0): number {
  const row = table.rows[r]
  if (!row) return 0
  const cell = row.cells[c]
  if (!cell) return 0
  if (cell.formula && depth < 8) {
    const v = evaluateFormula(cell.formula, table, depth + 1)
    return v ?? 0
  }
  const text = stripHtml(cell.html).replace(/[^\d.\-]/g, '')
  const n = parseFloat(text)
  return isNaN(n) ? 0 : n
}

function parseRef(ref: string): { r: number; c: number } | null {
  const m = /^([A-Za-z]+)(\d+)$/.exec(ref.trim())
  if (!m) return null
  return { r: parseInt(m[2], 10) - 1, c: colLetterToIndex(m[1]) }
}

function sumRange(table: TableData, a: string, b: string, depth: number): number {
  const pa = parseRef(a)
  const pb = parseRef(b)
  if (!pa || !pb) return 0
  const r1 = Math.min(pa.r, pb.r)
  const r2 = Math.max(pa.r, pb.r)
  const c1 = Math.min(pa.c, pb.c)
  const c2 = Math.max(pa.c, pb.c)
  let total = 0
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      total += cellNumericValue(table, r, c, depth)
    }
  }
  return total
}

/**
 * Supports formulas like:
 *   =SUM(A2:A5)
 *   =A2+B2
 *   =A2+B2+C2-D2
 * Cell refs use spreadsheet-style column letters (A, B, C...) and 1-based row numbers
 * matching the visual row position in the table (including header rows).
 */
export function evaluateFormula(formula: string, table: TableData, depth = 0): number | null {
  if (!formula) return null
  let expr = formula.trim()
  if (expr.startsWith('=')) expr = expr.slice(1)

  expr = expr.replace(/SUM\(\s*([A-Za-z]+\d+)\s*:\s*([A-Za-z]+\d+)\s*\)/gi, (_m, a, b) =>
    String(sumRange(table, a, b, depth)),
  )

  expr = expr.replace(/[A-Za-z]+\d+/g, (ref) => {
    const p = parseRef(ref)
    if (!p) return '0'
    return String(cellNumericValue(table, p.r, p.c, depth))
  })

  if (!/^[\d\s+\-*/().]*$/.test(expr)) return null
  try {
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr || '0'})`)()
    return typeof result === 'number' && isFinite(result) ? result : null
  } catch {
    return null
  }
}

export function columnAutoSum(table: TableData, colIndex: number, excludeRowIndexes: Set<number>): number {
  let total = 0
  table.rows.forEach((row, r) => {
    if (excludeRowIndexes.has(r) || row.isHeader || row.isTotalRow) return
    total += cellNumericValue(table, r, colIndex)
  })
  return total
}
