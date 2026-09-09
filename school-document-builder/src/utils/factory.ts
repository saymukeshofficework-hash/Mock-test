import { uid } from './id'
import type {
  CheckboxElement,
  DateElement,
  DocumentElement,
  HeadingElement,
  ImageElement,
  KeyValueElement,
  LineElement,
  ListElement,
  Margins,
  PageBreakElement,
  ParagraphElement,
  SchoolDocument,
  SignatureElement,
  SpacerElement,
  StampElement,
  TableCell,
  TableColumn,
  TableData,
  TableElement,
  TableRow,
} from '../types/document'

export const DEFAULT_MARGINS: Margins = { top: 20, bottom: 18, left: 20, right: 18 }

export function newCell(html = '', isHeader = false): TableCell {
  return {
    id: uid('cell'),
    html,
    colspan: 1,
    rowspan: 1,
    merged: false,
    align: isHeader ? 'center' : 'left',
    valign: 'middle',
    bold: isHeader,
    italic: false,
    underline: false,
    fontSize: 13,
    bg: isHeader ? '#f1f3f8' : '',
  }
}

export function newTable(rows: number, cols: number): TableData {
  const columns: TableColumn[] = Array.from({ length: cols }, () => ({
    id: uid('col'),
    widthPct: 100 / cols,
  }))
  const rowsArr: TableRow[] = Array.from({ length: rows }, (_, r) => ({
    id: uid('row'),
    isHeader: r === 0,
    isTotalRow: false,
    cells: Array.from({ length: cols }, () => newCell('', r === 0)),
  }))
  return { columns, rows: rowsArr, borders: 'all', autoSerial: false }
}

export function newTableElement(rows = 3, cols = 4): TableElement {
  return { id: uid('el'), type: 'table', table: newTable(rows, cols) }
}

export function newHeading(text = '', level: 1 | 2 | 3 = 1): HeadingElement {
  return { id: uid('el'), type: 'heading', html: text, level, align: 'center' }
}

export function newParagraph(text = ''): ParagraphElement {
  return { id: uid('el'), type: 'paragraph', html: text, align: 'left' }
}

export function newImage(src = ''): ImageElement {
  return { id: uid('el'), type: 'image', src, widthPct: 40, align: 'left', caption: '' }
}

export function newSignature(): SignatureElement {
  return {
    id: uid('el'),
    type: 'signature',
    align: 'right',
    showDate: true,
    showPlace: true,
    slots: [
      { id: uid('sig'), name: '', designation: 'प्रधानाध्यापक', mobile: '' },
    ],
  }
}

export function newStamp(): StampElement {
  return { id: uid('el'), type: 'stamp', src: '', widthPct: 20, align: 'left' }
}

export function newKeyValue(label = 'क्रमांक', value = ''): KeyValueElement {
  return { id: uid('el'), type: 'keyvalue', label, value, align: 'left', underline: true, inline: true }
}

export function newDate(): DateElement {
  return { id: uid('el'), type: 'date', label: 'दिनांक', value: '', useToday: true, align: 'left' }
}

export function newLine(): LineElement {
  return { id: uid('el'), type: 'line', style: 'solid' }
}

export function newCheckbox(): CheckboxElement {
  return {
    id: uid('el'),
    type: 'checkbox',
    items: [
      { id: uid('chk'), text: 'विकल्प 1', checked: false },
      { id: uid('chk'), text: 'विकल्प 2', checked: false },
    ],
  }
}

export function newList(ordered = true): ListElement {
  return { id: uid('el'), type: 'list', ordered, items: ['प्रथम बिंदु', 'द्वितीय बिंदु'] }
}

export function newSpacer(): SpacerElement {
  return { id: uid('el'), type: 'spacer', heightPx: 24 }
}

export function newPageBreak(): PageBreakElement {
  return { id: uid('el'), type: 'pagebreak' }
}

export function createElement(kind: DocumentElement['type']): DocumentElement {
  switch (kind) {
    case 'heading':
      return newHeading()
    case 'paragraph':
      return newParagraph()
    case 'table':
      return newTableElement()
    case 'image':
      return newImage()
    case 'signature':
      return newSignature()
    case 'stamp':
      return newStamp()
    case 'keyvalue':
      return newKeyValue()
    case 'date':
      return newDate()
    case 'line':
      return newLine()
    case 'checkbox':
      return newCheckbox()
    case 'list':
      return newList()
    case 'spacer':
      return newSpacer()
    case 'pagebreak':
      return newPageBreak()
    default:
      return newParagraph()
  }
}

export function newBlankDocument(name = 'नया दस्तावेज़', docType = 'custom'): SchoolDocument {
  const now = Date.now()
  return {
    id: uid('doc'),
    name,
    docType,
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { ...DEFAULT_MARGINS },
    border: 'none',
    header: {
      visible: true,
      html: 'कार्यालय<br/>प्रधानाध्यापक<br/><strong>{{school_name}}</strong><br/>शिक्षा केंद्र - {{education_center}}, जिला - {{district}} ({{state}})',
      showSchoolLogo: false,
      showGovtLogo: false,
      showOnEveryPage: true,
    },
    elements: [],
    fields: {},
    createdAt: now,
    updatedAt: now,
    isTemplate: false,
  }
}
