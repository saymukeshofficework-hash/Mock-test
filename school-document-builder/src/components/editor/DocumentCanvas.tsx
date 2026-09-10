import type { DocumentElement, SchoolDocument } from '../../types/document'
import { getPageDimsMm } from './pageSize'
import ElementRenderer, { cloneElementWithNewId } from './ElementRenderer'
import { resolveVariables } from '../../utils/variables'
import { resolveElementForDisplay } from '../../utils/resolveElement'
import { getSchoolSettings } from '../../storage/schoolSettingsRepo'
import ScaleToFit from './ScaleToFit'

interface DocumentCanvasProps {
  doc: SchoolDocument
  readOnly: boolean
  selectedId: string | null
  onSelect: (id: string | null) => void
  onElementsChange: (elements: DocumentElement[]) => void
  variableContext: Record<string, string>
}

interface IndexedElement {
  el: DocumentElement
  index: number
}

function splitIntoPages(elements: DocumentElement[]): IndexedElement[][] {
  const pages: IndexedElement[][] = [[]]
  elements.forEach((el, index) => {
    if (el.type === 'pagebreak') {
      pages.push([])
    } else {
      pages[pages.length - 1].push({ el, index })
    }
  })
  return pages
}

const BORDER_CLASS = {
  none: '',
  thin: 'page-border-thin',
  double: 'page-border-double',
  gov: 'page-border-gov',
} as const

export default function DocumentCanvas({
  doc,
  readOnly,
  selectedId,
  onSelect,
  onElementsChange,
  variableContext,
}: DocumentCanvasProps) {
  const dims = getPageDimsMm(doc.pageSize, doc.orientation)
  const settings = getSchoolSettings()
  const pages = splitIntoPages(doc.elements)

  function patch(index: number, elPatch: Partial<DocumentElement>) {
    const elements = doc.elements.map((e, i) => (i === index ? ({ ...e, ...elPatch } as DocumentElement) : e))
    onElementsChange(elements)
  }
  function remove(index: number) {
    onElementsChange(doc.elements.filter((_, i) => i !== index))
    onSelect(null)
  }
  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= doc.elements.length) return
    const elements = [...doc.elements]
    ;[elements[index], elements[target]] = [elements[target], elements[index]]
    onElementsChange(elements)
  }
  function duplicate(index: number) {
    const clone = cloneElementWithNewId(doc.elements[index])
    const elements = [...doc.elements]
    elements.splice(index + 1, 0, clone)
    onElementsChange(elements)
  }

  return (
    <div className="print-root flex flex-col items-center gap-8 py-8" onClick={() => onSelect(null)}>
      {pages.map((pageElements, pageIdx) => (
        <ScaleToFit key={pageIdx}>
          <div
            className={`page-sheet ${BORDER_CLASS[doc.border]}`}
            style={{
              width: `${dims.w}mm`,
              minHeight: `${dims.h}mm`,
              paddingTop: `${doc.margins.top}mm`,
              paddingBottom: `${doc.margins.bottom}mm`,
              paddingLeft: `${doc.margins.left}mm`,
              paddingRight: `${doc.margins.right}mm`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {doc.header.visible && (pageIdx === 0 || doc.header.showOnEveryPage) && (
              <div className="flex items-start gap-3 border-b-2 border-black pb-2 mb-4">
                {doc.header.showSchoolLogo && settings.logo_url && (
                  <img src={settings.logo_url} alt="लोगो" className="w-14 h-14 object-contain" />
                )}
                <div
                  className="flex-1 text-center leading-snug font-devanagari"
                  dangerouslySetInnerHTML={{ __html: resolveVariables(doc.header.html, variableContext) }}
                />
                {doc.header.showGovtLogo && settings.govt_logo_url && (
                  <img src={settings.govt_logo_url} alt="शासकीय चिन्ह" className="w-14 h-14 object-contain" />
                )}
              </div>
            )}
            <div className="space-y-1">
              {pageElements.map(({ el, index }) => (
                <ElementRenderer
                  key={el.id}
                  element={readOnly ? resolveElementForDisplay(el, variableContext) : el}
                  index={index}
                  total={doc.elements.length}
                  readOnly={readOnly}
                  selected={selectedId === el.id}
                  onSelect={() => onSelect(el.id)}
                  onChange={(p) => patch(index, p)}
                  onDelete={() => remove(index)}
                  onMoveUp={() => move(index, -1)}
                  onMoveDown={() => move(index, 1)}
                  onDuplicate={() => duplicate(index)}
                />
              ))}
              {pageElements.length === 0 && !readOnly && (
                <div className="text-center text-slate-300 text-sm py-16 border-2 border-dashed border-slate-200 rounded">
                  बाएं मेनू से तत्व जोड़ें
                </div>
              )}
            </div>
          </div>
        </ScaleToFit>
      ))}
    </div>
  )
}
