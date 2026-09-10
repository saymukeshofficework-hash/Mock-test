export type Align = 'left' | 'center' | 'right' | 'justify'
export type VAlign = 'top' | 'middle' | 'bottom'

export interface BaseElement {
  id: string
  type: string
}

export interface HeadingElement extends BaseElement {
  type: 'heading'
  html: string
  level: 1 | 2 | 3
  align: Align
}

export interface ParagraphElement extends BaseElement {
  type: 'paragraph'
  html: string
  align: Align
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
  widthPct: number
  align: Align
  caption: string
}

export interface SignatureSlot {
  id: string
  imageSrc?: string
  name: string
  designation: string
  mobile: string
}

export interface SignatureElement extends BaseElement {
  type: 'signature'
  slots: SignatureSlot[]
  align: Align
  showDate: boolean
  showPlace: boolean
}

export interface StampElement extends BaseElement {
  type: 'stamp'
  src: string
  widthPct: number
  align: Align
  /** Fine vertical nudge (px) to place the seal exactly where it's needed, e.g. overlapping a signature. */
  offsetTopPx: number
}

export interface KeyValueElement extends BaseElement {
  type: 'keyvalue'
  label: string
  value: string
  align: Align
  underline: boolean
  inline: boolean
}

export interface DateElement extends BaseElement {
  type: 'date'
  label: string
  value: string
  useToday: boolean
  align: Align
}

export interface LineElement extends BaseElement {
  type: 'line'
  style: 'solid' | 'dashed' | 'double'
}

export interface CheckboxItem {
  id: string
  text: string
  checked: boolean
}

export interface CheckboxElement extends BaseElement {
  type: 'checkbox'
  items: CheckboxItem[]
}

export interface ListElement extends BaseElement {
  type: 'list'
  ordered: boolean
  items: string[]
}

export interface SpacerElement extends BaseElement {
  type: 'spacer'
  heightPx: number
}

export interface PageBreakElement extends BaseElement {
  type: 'pagebreak'
}

/* ---------------- Table ---------------- */

export interface TableCell {
  id: string
  html: string
  colspan: number
  rowspan: number
  merged: boolean
  align: Align
  valign: VAlign
  bold: boolean
  italic: boolean
  underline: boolean
  fontSize: number
  bg: string
  formula?: string
}

export interface TableColumn {
  id: string
  widthPct: number
}

export interface TableRow {
  id: string
  cells: TableCell[]
  isHeader: boolean
  isTotalRow: boolean
  heightPx?: number
}

export interface TableData {
  columns: TableColumn[]
  rows: TableRow[]
  borders: 'all' | 'outer' | 'none'
  autoSerial: boolean
}

export interface TableElement extends BaseElement {
  type: 'table'
  table: TableData
}

export type DocumentElement =
  | HeadingElement
  | ParagraphElement
  | ImageElement
  | SignatureElement
  | StampElement
  | KeyValueElement
  | DateElement
  | LineElement
  | CheckboxElement
  | ListElement
  | SpacerElement
  | PageBreakElement
  | TableElement

/* ---------------- Document ---------------- */

export type PageSize = 'A4' | 'A5' | 'Letter' | 'Legal'
export type Orientation = 'portrait' | 'landscape'
export type PageBorder = 'none' | 'thin' | 'double' | 'gov'

export interface Margins {
  top: number
  bottom: number
  left: number
  right: number
}

export interface DocumentHeader {
  visible: boolean
  html: string
  showSchoolLogo: boolean
  showGovtLogo: boolean
  showOnEveryPage: boolean
}

export interface SchoolDocument {
  id: string
  name: string
  docType: string
  pageSize: PageSize
  orientation: Orientation
  margins: Margins
  border: PageBorder
  header: DocumentHeader
  elements: DocumentElement[]
  fields: Record<string, string>
  createdAt: number
  updatedAt: number
  isTemplate: boolean
  templateDescription?: string
}

export interface TemplateMeta {
  id: string
  name: string
  description: string
  docType: string
  builtin: boolean
}
