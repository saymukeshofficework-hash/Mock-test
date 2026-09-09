import type { TableData } from '../types/document'
import { newCell } from './factory'

export interface CellPos {
  r: number
  c: number
}

function cols(table: TableData): number {
  return table.columns.length
}

export function addRow(table: TableData, atIndex: number): TableData {
  const n = cols(table)
  const row = { id: crypto.randomUUID(), isHeader: false, isTotalRow: false, cells: Array.from({ length: n }, () => newCell('')) }
  const rows = [...table.rows]
  rows.splice(atIndex, 0, row)
  return { ...table, rows }
}

export function deleteRow(table: TableData, index: number): TableData {
  if (table.rows.length <= 1) return table
  const rows = table.rows.filter((_, i) => i !== index)
  return { ...table, rows }
}

export function addColumn(table: TableData, atIndex: number): TableData {
  const columns = [...table.columns]
  const evenWidth = 100 / (columns.length + 1)
  const newColumns = columns.map((c) => ({ ...c, widthPct: evenWidth }))
  newColumns.splice(atIndex, 0, { id: crypto.randomUUID(), widthPct: evenWidth })
  const rows = table.rows.map((row) => {
    const cells = [...row.cells]
    cells.splice(atIndex, 0, newCell('', row.isHeader))
    return { ...row, cells }
  })
  return { ...table, columns: newColumns, rows }
}

export function deleteColumn(table: TableData, index: number): TableData {
  if (table.columns.length <= 1) return table
  const removedWidth = table.columns[index].widthPct
  const columns = table.columns.filter((_, i) => i !== index)
  const add = removedWidth / Math.max(columns.length, 1)
  const newColumns = columns.map((c) => ({ ...c, widthPct: c.widthPct + add }))
  const rows = table.rows.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) }))
  return { ...table, columns: newColumns, rows }
}

export function setColumnWidth(table: TableData, index: number, widthPct: number): TableData {
  const columns = table.columns.map((c, i) => (i === index ? { ...c, widthPct } : c))
  return { ...table, columns }
}

export function updateCell(table: TableData, r: number, c: number, patch: Partial<TableData['rows'][number]['cells'][number]>): TableData {
  const rows = table.rows.map((row, ri) => {
    if (ri !== r) return row
    const cells = row.cells.map((cell, ci) => (ci === c ? { ...cell, ...patch } : cell))
    return { ...row, cells }
  })
  return { ...table, rows }
}

export function toggleRowFlag(table: TableData, r: number, flag: 'isHeader' | 'isTotalRow'): TableData {
  const rows = table.rows.map((row, ri) => (ri === r ? { ...row, [flag]: !row[flag] } : row))
  return { ...table, rows }
}

/** Merge the rectangular selection between a and b into one cell. */
export function mergeCells(table: TableData, a: CellPos, b: CellPos): TableData {
  const r1 = Math.min(a.r, b.r)
  const r2 = Math.max(a.r, b.r)
  const c1 = Math.min(a.c, b.c)
  const c2 = Math.max(a.c, b.c)
  if (r1 === r2 && c1 === c2) return table

  const rows = table.rows.map((row) => ({ ...row, cells: [...row.cells] }))
  const masterCell = { ...rows[r1].cells[c1] }
  const combinedText: string[] = []
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = rows[r].cells[c]
      const text = cell.html.replace(/<[^>]*>/g, ' ').trim()
      if (text && !(r === r1 && c === c1)) combinedText.push(text)
      if (r === r1 && c === c1) continue
      rows[r].cells[c] = { ...cell, merged: true, colspan: 1, rowspan: 1, html: '' }
    }
  }
  masterCell.colspan = c2 - c1 + 1
  masterCell.rowspan = r2 - r1 + 1
  masterCell.merged = false
  if (combinedText.length && !masterCell.html.replace(/<[^>]*>/g, '').trim()) {
    masterCell.html = combinedText.join(' ')
  }
  rows[r1].cells[c1] = masterCell
  return { ...table, rows }
}

/** Split a previously merged master cell back into individual cells. */
export function splitCell(table: TableData, pos: CellPos): TableData {
  const master = table.rows[pos.r]?.cells[pos.c]
  if (!master || (master.colspan <= 1 && master.rowspan <= 1)) return table
  const rows = table.rows.map((row) => ({ ...row, cells: [...row.cells] }))
  const r1 = pos.r
  const c1 = pos.c
  const r2 = r1 + master.rowspan - 1
  const c2 = c1 + master.colspan - 1
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r === r1 && c === c1) {
        rows[r].cells[c] = { ...rows[r].cells[c], colspan: 1, rowspan: 1 }
      } else if (rows[r]?.cells[c]) {
        rows[r].cells[c] = { ...rows[r].cells[c], merged: false, colspan: 1, rowspan: 1 }
      }
    }
  }
  return { ...table, rows }
}

export function isCellVisible(table: TableData, r: number, c: number): boolean {
  return !table.rows[r].cells[c].merged
}
