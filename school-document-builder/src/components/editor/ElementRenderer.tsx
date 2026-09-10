import type { DocumentElement } from '../../types/document'
import ElementWrapper from '../elements/ElementWrapper'
import { HeadingBlock, ParagraphBlock } from '../elements/TextElements'
import {
  CheckboxBlock,
  DateBlock,
  ImageBlock,
  KeyValueBlock,
  LineBlock,
  ListBlock,
  PageBreakBlock,
  SpacerBlock,
  StampBlock,
} from '../elements/MiscElements'
import SignatureBlockView from '../elements/SignatureBlock'
import TableBlock from '../table/TableBlock'
import { uid } from '../../utils/id'

interface ElementRendererProps {
  element: DocumentElement
  index: number
  total: number
  readOnly: boolean
  selected: boolean
  onSelect: () => void
  onChange: (patch: Partial<DocumentElement>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
}

export default function ElementRenderer({
  element,
  readOnly,
  selected,
  onSelect,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
}: ElementRendererProps) {
  let content
  switch (element.type) {
    case 'heading':
      content = <HeadingBlock element={element} readOnly={readOnly} selected={selected} onChange={onChange as never} />
      break
    case 'paragraph':
      content = <ParagraphBlock element={element} readOnly={readOnly} selected={selected} onChange={onChange as never} />
      break
    case 'table':
      content = <TableBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'image':
      content = <ImageBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'signature':
      content = <SignatureBlockView element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'stamp':
      content = <StampBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'keyvalue':
      content = <KeyValueBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'date':
      content = <DateBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'line':
      content = <LineBlock element={element} />
      break
    case 'checkbox':
      content = <CheckboxBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'list':
      content = <ListBlock element={element} readOnly={readOnly} onChange={onChange as never} />
      break
    case 'spacer':
      content = <SpacerBlock element={element} readOnly={readOnly} />
      break
    case 'pagebreak':
      content = <PageBreakBlock readOnly={readOnly} />
      break
    default:
      content = null
  }

  return (
    <ElementWrapper
      selected={selected}
      readOnly={readOnly}
      onSelect={onSelect}
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onDuplicate={onDuplicate}
    >
      {content}
    </ElementWrapper>
  )
}

export function cloneElementWithNewId(el: DocumentElement): DocumentElement {
  const cloned = JSON.parse(JSON.stringify(el)) as DocumentElement
  cloned.id = uid('el')
  if (cloned.type === 'table') {
    cloned.table.rows.forEach((row) => {
      row.id = uid('row')
      row.cells.forEach((cell) => (cell.id = uid('cell')))
    })
    cloned.table.columns.forEach((c) => (c.id = uid('col')))
  }
  if (cloned.type === 'signature') {
    cloned.slots.forEach((s) => (s.id = uid('sig')))
  }
  if (cloned.type === 'checkbox') {
    cloned.items.forEach((i) => (i.id = uid('chk')))
  }
  return cloned
}
