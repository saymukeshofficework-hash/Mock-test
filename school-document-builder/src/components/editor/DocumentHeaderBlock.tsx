import { useState } from 'react'
import type { DocumentHeader } from '../../types/document'
import type { SchoolSettings } from '../../types/school'
import RichText from '../common/RichText'
import FormatToolbar from '../common/FormatToolbar'
import VariablePicker from '../common/VariablePicker'
import { resolveVariables } from '../../utils/variables'

interface DocumentHeaderBlockProps {
  header: DocumentHeader
  settings: SchoolSettings
  readOnly: boolean
  variableContext: Record<string, string>
  onChange: (html: string) => void
}

export default function DocumentHeaderBlock({ header, settings, readOnly, variableContext, onChange }: DocumentHeaderBlockProps) {
  const [focused, setFocused] = useState(false)
  const [showVars, setShowVars] = useState(false)

  return (
    <div
      className="flex items-start gap-3 border-b-2 border-black pb-2 mb-4"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        // Only hide once focus truly leaves the whole header block (content + toolbar).
        // Without this check, tapping a toolbar select/button would itself blur the
        // contentEditable and instantly hide the toolbar before the tap could register.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false)
        }
      }}
    >
      {header.showSchoolLogo && settings.logo_url && (
        <img src={settings.logo_url} alt="लोगो" className="w-14 h-14 object-contain shrink-0" />
      )}
      <div className="flex-1">
        {!readOnly && focused && (
          <div className="mb-1 flex justify-center">
            <FormatToolbar onInsertVariable={() => setShowVars(true)} />
          </div>
        )}
        <RichText
          html={readOnly ? resolveVariables(header.html, variableContext) : header.html}
          onChange={onChange}
          align="center"
          className="leading-snug font-devanagari"
          placeholder="हेडर टेक्स्ट लिखें..."
          readOnly={readOnly}
        />
      </div>
      {header.showGovtLogo && settings.govt_logo_url && (
        <img src={settings.govt_logo_url} alt="शासकीय चिन्ह" className="w-14 h-14 object-contain shrink-0" />
      )}
      {showVars && (
        <VariablePicker onClose={() => setShowVars(false)} onPick={(key) => onChange(`${header.html} {{${key}}}`)} />
      )}
    </div>
  )
}
