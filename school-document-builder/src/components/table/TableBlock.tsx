import { useMemo, useRef, useState } from 'react'
import type { TableData, TableElement } from '../../types/document'
import RichText from '../common/RichText'
import {
  addColumn,
  addRow,
  deleteColumn,
  deleteRow,
  mergeCells,
  selectAllCells,
  setColumnWidth,
  setRowHeight,
  splitCell,
  toggleRowFlag,
  updateCell,
  updateCellsInRange,
  type CellPos,
} from '../../utils/tableOps'
import { columnAutoSum, evaluateFormula, stripHtml } from '../../utils/formulas'
import { applyPastedGrid, parseTabularPaste } from '../../utils/tablePaste'

interface TableBlockProps {
  element: TableElement
  readOnly: boolean
  onChange: (patch: Partial<TableElement>) => void
}

function sameCell(a: CellPos | null, b: CellPos | null) {
  return !!a && !!b && a.r === b.r && a.c === b.c
}

function inSelection(sel: { a: CellPos; b: CellPos } | null, r: number, c: number) {
  if (!sel) return false
  const r1 = Math.min(sel.a.r, sel.b.r)
  const r2 = Math.max(sel.a.r, sel.b.r)
  const c1 = Math.min(sel.a.c, sel.b.c)
  const c2 = Math.max(sel.a.c, sel.b.c)
  return r >= r1 && r <= r2 && c >= c1 && c <= c2
}

const BORDER_CLASS: Record<TableData['borders'], string> = {
  all: 'border border-slate-800',
  outer: 'border-0',
  none: 'border-0',
}

export default function TableBlock({ element, readOnly, onChange }: TableBlockProps) {
  const table = element.table
  const [sel, setSel] = useState<{ a: CellPos; b: CellPos } | null>(null)
  const [activeCell, setActiveCell] = useState<CellPos | null>(null)
  const [formulaDraft, setFormulaDraft] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [pasteHasHeader, setPasteHasHeader] = useState(true)
  const [pasteResult, setPasteResult] = useState<number | null>(null)
  const dragCol = useRef<{ index: number; startX: number; startWidth: number; nextWidth: number } | null>(null)

  const setTable = (t: TableData) => onChange({ table: t })

  const excludeTotals = useMemo(() => {
    const s = new Set<number>()
    table.rows.forEach((r, i) => {
      if (r.isTotalRow) s.add(i)
    })
    return s
  }, [table.rows])

  function isAutoComputed(r: number, c: number): boolean {
    const cell = table.rows[r].cells[c]
    if (cell.formula) return true
    if (table.rows[r].isTotalRow && !stripHtml(cell.html)) return true
    return false
  }

  function displayValue(r: number, c: number): string {
    const cell = table.rows[r].cells[c]
    if (cell.formula) {
      const val = evaluateFormula(cell.formula, table)
      return val !== null ? String(val) : cell.formula
    }
    return String(columnAutoSum(table, c, excludeTotals))
  }

  function onCellMouseDown(r: number, c: number, e: React.MouseEvent) {
    if (readOnly) return
    setActiveCell({ r, c })
    setFormulaDraft(table.rows[r].cells[c].formula || '')
    if (e.shiftKey && activeCell) {
      setSel({ a: activeCell, b: { r, c } })
    } else {
      setSel({ a: { r, c }, b: { r, c } })
    }
  }

  function startColResize(index: number, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = table.columns[index + 1]
    if (!next) return
    dragCol.current = { index, startX: e.clientX, startWidth: table.columns[index].widthPct, nextWidth: next.widthPct }
    const onMove = (ev: MouseEvent) => {
      if (!dragCol.current) return
      const tableEl = document.getElementById(`table-${element.id}`)
      const totalWidth = tableEl?.clientWidth || 800
      const deltaPct = ((ev.clientX - dragCol.current.startX) / totalWidth) * 100
      let w1 = dragCol.current.startWidth + deltaPct
      let w2 = dragCol.current.nextWidth - deltaPct
      if (w1 < 4 || w2 < 4) return
      let t = setColumnWidth(table, dragCol.current.index, w1)
      t = setColumnWidth(t, dragCol.current.index + 1, w2)
      setTable(t)
    }
    const onUp = () => {
      dragCol.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const hasMultiSelection = !!sel && (sel.a.r !== sel.b.r || sel.a.c !== sel.b.c)
  const activeMaster = activeCell ? table.rows[activeCell.r]?.cells[activeCell.c] : null
  const canSplit = !!activeMaster && (activeMaster.colspan > 1 || activeMaster.rowspan > 1)
  const selectedCellCount = sel ? (Math.abs(sel.a.r - sel.b.r) + 1) * (Math.abs(sel.a.c - sel.b.c) + 1) : 0

  function applyCellPatch(patch: Partial<TableData['rows'][number]['cells'][number]>) {
    if (hasMultiSelection && sel) {
      setTable(updateCellsInRange(table, sel.a, sel.b, patch))
    } else if (activeCell) {
      setTable(updateCell(table, activeCell.r, activeCell.c, patch))
    }
  }

  function selectionCells(): CellPos[] {
    if (hasMultiSelection && sel) {
      const r1 = Math.min(sel.a.r, sel.b.r)
      const r2 = Math.max(sel.a.r, sel.b.r)
      const c1 = Math.min(sel.a.c, sel.b.c)
      const c2 = Math.max(sel.a.c, sel.b.c)
      const list: CellPos[] = []
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (!table.rows[r].cells[c].merged) list.push({ r, c })
        }
      }
      return list
    }
    return activeCell ? [activeCell] : []
  }

  /** Toggles a boolean cell flag across the whole selection: turns it on for everyone
   *  unless every selected cell already has it on, in which case it turns it off. This
   *  avoids the anchor cell (which can be a header, already bold) deciding the outcome. */
  function toggleBoolFlag(flag: 'bold' | 'italic' | 'underline') {
    const cells = selectionCells()
    if (!cells.length) return
    const allOn = cells.every(({ r, c }) => table.rows[r].cells[c][flag])
    applyCellPatch({ [flag]: !allOn })
  }

  function selectAll() {
    const full = selectAllCells(table)
    setSel(full)
    setActiveCell(full.a)
    setFormulaDraft('')
  }

  function applyPaste(source: string) {
    const grid = parseTabularPaste(source)
    if (grid.length === 0) {
      setPasteResult(0)
      return
    }
    setTable(applyPastedGrid(table, grid, pasteHasHeader))
    setPasteResult(pasteHasHeader ? grid.length - 1 : grid.length)
  }

  return (
    <div className="my-2">
      {!readOnly && (
        <div className="no-print flex flex-wrap items-center gap-2 mb-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs">
          <button className="tbl-btn" onClick={() => setTable(addRow(table, table.rows.length))}>+ पंक्ति</button>
          <button className="tbl-btn" onClick={() => setTable(addColumn(table, table.columns.length))}>+ कॉलम</button>
          <button className="tbl-btn" onClick={selectAll}>सभी सेल चुनें</button>
          <button
            className={`tbl-btn ${showPaste ? 'bg-brand-600 text-white border-brand-600' : ''}`}
            onClick={() => setShowPaste((s) => !s)}
          >
            डेटा पेस्ट करें
          </button>
          {activeCell && (
            <>
              <label className="tbl-btn flex items-center gap-1">
                पंक्ति ऊंचाई
                <input
                  type="number"
                  className="w-14 border-none outline-none"
                  min={0}
                  placeholder="auto"
                  value={table.rows[activeCell.r].heightPx ?? ''}
                  onChange={(e) =>
                    setTable(setRowHeight(table, activeCell.r, e.target.value ? Number(e.target.value) : undefined))
                  }
                />
                px
              </label>
              <label className="tbl-btn flex items-center gap-1">
                कॉलम चौड़ाई
                <input
                  type="number"
                  className="w-14 border-none outline-none"
                  min={4}
                  max={100}
                  value={Math.round(table.columns[activeCell.c].widthPct * 10) / 10}
                  onChange={(e) => setTable(setColumnWidth(table, activeCell.c, Number(e.target.value) || 4))}
                />
                %
              </label>
            </>
          )}
          {activeCell && (
            <>
              <button className="tbl-btn" onClick={() => setTable(addRow(table, activeCell.r))}>ऊपर पंक्ति जोड़ें</button>
              <button className="tbl-btn" onClick={() => setTable(addRow(table, activeCell.r + 1))}>नीचे पंक्ति जोड़ें</button>
              <button className="tbl-btn" onClick={() => setTable(deleteRow(table, activeCell.r))}>पंक्ति हटाएं</button>
              <button className="tbl-btn" onClick={() => setTable(addColumn(table, activeCell.c))}>बाएं कॉलम जोड़ें</button>
              <button className="tbl-btn" onClick={() => setTable(addColumn(table, activeCell.c + 1))}>दाएं कॉलम जोड़ें</button>
              <button className="tbl-btn" onClick={() => setTable(deleteColumn(table, activeCell.c))}>कॉलम हटाएं</button>
              <button className="tbl-btn" onClick={() => setTable(toggleRowFlag(table, activeCell.r, 'isHeader'))}>
                {table.rows[activeCell.r].isHeader ? 'हेडर हटाएं' : 'हेडर बनाएं'}
              </button>
              <button className="tbl-btn" onClick={() => setTable(toggleRowFlag(table, activeCell.r, 'isTotalRow'))}>
                {table.rows[activeCell.r].isTotalRow ? 'कुल पंक्ति हटाएं' : 'कुल पंक्ति बनाएं'}
              </button>
            </>
          )}
          {hasMultiSelection && (
            <button
              className="tbl-btn bg-brand-600 text-white border-brand-600"
              onClick={() => {
                if (!sel) return
                setTable(mergeCells(table, sel.a, sel.b))
                setSel(null)
              }}
            >
              सेल मिलाएं (Merge)
            </button>
          )}
          {canSplit && (
            <button
              className="tbl-btn"
              onClick={() => {
                if (!activeCell) return
                setTable(splitCell(table, activeCell))
              }}
            >
              विभाजित करें (Split)
            </button>
          )}
          <label className="tbl-btn flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={table.autoSerial}
              onChange={(e) => setTable({ ...table, autoSerial: e.target.checked })}
            />
            क्र. कॉलम
          </label>
          <select
            className="tbl-btn"
            value={table.borders}
            onChange={(e) => setTable({ ...table, borders: e.target.value as TableData['borders'] })}
          >
            <option value="all">सभी सीमाएं</option>
            <option value="outer">बाहरी सीमा</option>
            <option value="none">बिना सीमा</option>
          </select>
          {activeCell && (
            <span className="flex items-center gap-1">
              <span>fx</span>
              <input
                className="border rounded px-1 py-0.5 w-40"
                placeholder="=SUM(A2:A5)"
                value={formulaDraft}
                onChange={(e) => setFormulaDraft(e.target.value)}
                onBlur={() => {
                  if (!activeCell) return
                  setTable(updateCell(table, activeCell.r, activeCell.c, { formula: formulaDraft || undefined }))
                }}
              />
            </span>
          )}
        </div>
      )}

      {!readOnly && showPaste && (
        <div className="no-print border border-dashed border-brand-300 bg-brand-50 rounded-lg p-2 mb-2 space-y-1.5">
          <p className="text-xs text-slate-600">
            Excel/Sheets से कॉपी की गई पंक्तियाँ यहाँ पेस्ट करें — यदि पहली पंक्ति हेडर (कॉलम नाम) है और तालिका के
            हेडर से मेल खाती है तो कॉलम अपने आप सही जगह भर जाएंगे, वरना क्रम अनुसार भरे जाएंगे। ज़रूरत पड़ने पर नई
            पंक्तियाँ अपने आप जुड़ जाएंगी।
          </p>
          <textarea
            className="w-full border border-slate-200 rounded px-2 py-1 text-xs min-h-[70px] font-mono bg-white"
            placeholder={'कक्षा\tबालक\tबालिका\tकुल\nकक्षा 1\t18\t16\t34'}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData('text')
              if (!pasted) return
              setPasteText(pasted)
              setTimeout(() => applyPaste(pasted), 0)
            }}
          />
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={pasteHasHeader} onChange={(e) => setPasteHasHeader(e.target.checked)} />
              पहली पंक्ति हेडर है
            </label>
            <button
              type="button"
              className="px-3 py-1 rounded bg-brand-600 text-white text-xs font-medium hover:bg-brand-700"
              onClick={() => applyPaste(pasteText)}
            >
              तालिका भरें
            </button>
            {pasteResult !== null && (
              <span className="text-xs text-green-600">{pasteResult} पंक्तियाँ भरी गईं ✓</span>
            )}
          </div>
        </div>
      )}

      <table
        id={`table-${element.id}`}
        className={`w-full border-collapse text-sm ${BORDER_CLASS[table.borders]}`}
        style={{ tableLayout: 'fixed' }}
      >
        <colgroup>
          {table.autoSerial && <col style={{ width: '6%' }} />}
          {table.columns.map((col) => (
            <col key={col.id} style={{ width: `${col.widthPct}%` }} />
          ))}
        </colgroup>
        <tbody>
          {table.rows.map((row, r) => (
            <tr key={row.id} style={row.heightPx ? { height: row.heightPx } : undefined}>
              {table.autoSerial && (
                <td
                  className={table.borders !== 'none' ? 'border border-slate-800 text-center align-middle' : 'text-center align-middle'}
                  style={{ fontWeight: row.isHeader ? 600 : 400, background: row.isHeader ? '#f1f3f8' : undefined }}
                >
                  {row.isHeader ? 'क्र.' : r}
                </td>
              )}
              {row.cells.map((cell, c) => {
                if (cell.merged) return null
                const isSelected = sameCell(activeCell, { r, c })
                const isInRange = inSelection(sel, r, c) && hasMultiSelection
                const isComputed = isAutoComputed(r, c)
                return (
                  <td
                    key={cell.id}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                    onMouseDown={(e) => onCellMouseDown(r, c, e)}
                    className={
                      (table.borders !== 'none' ? 'border border-slate-800 ' : '') +
                      'relative align-top p-1 ' +
                      (isSelected ? 'ring-2 ring-inset ring-brand-500 ' : '') +
                      (isInRange ? 'bg-brand-50 ' : '')
                    }
                    style={{
                      textAlign: cell.align,
                      verticalAlign: cell.valign,
                      background: isInRange ? undefined : cell.bg || undefined,
                      fontSize: cell.fontSize,
                    }}
                  >
                    {isComputed ? (
                      <div
                        className={`px-1 min-h-[1.4em] ${cell.bold ? 'font-bold' : ''}`}
                        title={cell.formula ? `सूत्र: ${cell.formula}` : 'स्वतः कुल'}
                      >
                        {displayValue(r, c)}
                      </div>
                    ) : (
                      <RichText
                        html={cell.html}
                        onChange={(html) => setTable(updateCell(table, r, c, { html }))}
                        placeholder=""
                        className={`px-1 ${cell.bold ? 'font-bold' : ''} ${cell.italic ? 'italic' : ''} ${cell.underline ? 'underline' : ''}`}
                        style={{ textAlign: cell.align }}
                        readOnly={readOnly}
                      />
                    )}
                    {!readOnly && c < table.columns.length - 1 && r === 0 && (
                      <div
                        className="no-print absolute top-0 right-[-3px] w-1.5 h-full cursor-col-resize z-10"
                        onMouseDown={(e) => startColResize(c, e)}
                      />
                    )}
                  </td>
                )
              })}
              {!readOnly && (
                <td className="no-print border-0 p-0 align-middle w-6">
                  <button
                    type="button"
                    title="पंक्ति हटाएं"
                    disabled={table.rows.length <= 1}
                    className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={() => setTable(deleteRow(table, r))}
                  >
                    🗑
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && activeCell && (
        <div className="no-print flex flex-wrap items-center gap-2 mt-1 text-xs bg-white border border-slate-200 rounded px-2 py-1">
          <span>
            {hasMultiSelection ? `चयनित ${selectedCellCount} सेल फॉर्मेट:` : 'चयनित सेल फॉर्मेट:'}
          </span>
          <button className="tbl-btn" onClick={() => toggleBoolFlag('bold')}>B</button>
          <button className="tbl-btn italic" onClick={() => toggleBoolFlag('italic')}>I</button>
          <button className="tbl-btn underline" onClick={() => toggleBoolFlag('underline')}>U</button>
          <select
            className="tbl-btn"
            value={table.rows[activeCell.r].cells[activeCell.c].align}
            onChange={(e) => applyCellPatch({ align: e.target.value as never })}
          >
            <option value="left">बाएं</option>
            <option value="center">केंद्र</option>
            <option value="right">दाएं</option>
          </select>
          <select
            className="tbl-btn"
            value={table.rows[activeCell.r].cells[activeCell.c].valign}
            onChange={(e) => applyCellPatch({ valign: e.target.value as never })}
          >
            <option value="top">ऊपर</option>
            <option value="middle">मध्य</option>
            <option value="bottom">नीचे</option>
          </select>
          <input
            type="color"
            className="w-7 h-6 border rounded"
            value={table.rows[activeCell.r].cells[activeCell.c].bg || '#ffffff'}
            onChange={(e) => applyCellPatch({ bg: e.target.value })}
          />
          <input
            type="number"
            className="tbl-btn w-14"
            value={table.rows[activeCell.r].cells[activeCell.c].fontSize}
            onChange={(e) => applyCellPatch({ fontSize: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  )
}
