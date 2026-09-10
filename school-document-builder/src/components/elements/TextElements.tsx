import { useState } from 'react'
import type { HeadingElement, ParagraphElement } from '../../types/document'
import RichText from '../common/RichText'
import FormatToolbar from '../common/FormatToolbar'
import VariablePicker from '../common/VariablePicker'

const HEADING_SIZE: Record<1 | 2 | 3, string> = {
  1: 'text-2xl font-bold',
  2: 'text-xl font-semibold',
  3: 'text-lg font-semibold',
}

export function HeadingBlock({
  element,
  readOnly,
  selected,
  onChange,
}: {
  element: HeadingElement
  readOnly: boolean
  selected: boolean
  onChange: (patch: Partial<HeadingElement>) => void
}) {
  const [showVars, setShowVars] = useState(false)
  return (
    <div>
      {!readOnly && selected && (
        <div className="mb-1">
          <FormatToolbar onInsertVariable={() => setShowVars(true)} />
        </div>
      )}
      <RichText
        html={element.html}
        onChange={(html) => onChange({ html })}
        align={element.align}
        className={`${HEADING_SIZE[element.level]} font-devanagari`}
        placeholder="शीर्षक लिखें..."
        readOnly={readOnly}
      />
      {showVars && (
        <VariablePicker onClose={() => setShowVars(false)} onPick={(key) => onChange({ html: `${element.html} {{${key}}}` })} />
      )}
    </div>
  )
}

export function ParagraphBlock({
  element,
  readOnly,
  selected,
  onChange,
}: {
  element: ParagraphElement
  readOnly: boolean
  selected: boolean
  onChange: (patch: Partial<ParagraphElement>) => void
}) {
  const [showVars, setShowVars] = useState(false)
  return (
    <div>
      {!readOnly && selected && (
        <div className="mb-1">
          <FormatToolbar onInsertVariable={() => setShowVars(true)} />
        </div>
      )}
      <RichText
        html={element.html}
        onChange={(html) => onChange({ html })}
        align={element.align}
        className="text-[15px] leading-relaxed font-devanagari"
        placeholder="अनुच्छेद लिखें..."
        readOnly={readOnly}
      />
      {showVars && (
        <VariablePicker onClose={() => setShowVars(false)} onPick={(key) => onChange({ html: `${element.html} {{${key}}}` })} />
      )}
    </div>
  )
}
