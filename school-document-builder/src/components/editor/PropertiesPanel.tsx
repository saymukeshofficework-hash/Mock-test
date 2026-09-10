import type { Align, DocumentElement, SchoolDocument } from '../../types/document'
import { VARIABLE_DEFS, extractUsedVariables } from '../../utils/variables'

interface PropertiesPanelProps {
  doc: SchoolDocument
  selectedElement: DocumentElement | null
  onDocChange: (patch: Partial<SchoolDocument>) => void
  onElementChange: (patch: Partial<DocumentElement>) => void
}

const FIELD = 'w-full border border-slate-200 rounded px-2 py-1 text-sm'
const LABEL = 'block text-xs font-medium text-slate-500 mb-1'

function AlignPicker({ value, onChange }: { value: Align; onChange: (a: Align) => void }) {
  return (
    <div className="flex gap-1">
      {(['left', 'center', 'right', 'justify'] as Align[]).map((a) => (
        <button
          key={a}
          className={`flex-1 py-1 text-xs rounded border ${value === a ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 hover:bg-slate-50'}`}
          onClick={() => onChange(a)}
        >
          {a === 'left' ? 'बाएं' : a === 'center' ? 'मध्य' : a === 'right' ? 'दाएं' : 'जस्टिफाई'}
        </button>
      ))}
    </div>
  )
}

function ElementProps({ element, onChange }: { element: DocumentElement; onChange: (p: Partial<DocumentElement>) => void }) {
  switch (element.type) {
    case 'heading':
      return (
        <div className="space-y-3">
          <div>
            <span className={LABEL}>स्तर</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  className={`flex-1 py-1 text-xs rounded border ${element.level === lvl ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`}
                  onClick={() => onChange({ level: lvl } as never)}
                >
                  H{lvl}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={LABEL}>संरेखण</span>
            <AlignPicker value={element.align} onChange={(align) => onChange({ align } as never)} />
          </div>
        </div>
      )
    case 'paragraph':
      return (
        <div>
          <span className={LABEL}>संरेखण</span>
          <AlignPicker value={element.align} onChange={(align) => onChange({ align } as never)} />
        </div>
      )
    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <span className={LABEL}>चौड़ाई (%)</span>
            <input type="range" min={10} max={100} className="w-full" value={element.widthPct} onChange={(e) => onChange({ widthPct: Number(e.target.value) } as never)} />
          </div>
          <div>
            <span className={LABEL}>संरेखण</span>
            <AlignPicker value={element.align} onChange={(align) => onChange({ align } as never)} />
          </div>
          <div>
            <span className={LABEL}>कैप्शन</span>
            <input className={FIELD} value={element.caption} onChange={(e) => onChange({ caption: e.target.value } as never)} />
          </div>
        </div>
      )
    case 'stamp':
      return (
        <div>
          <span className={LABEL}>चौड़ाई (%)</span>
          <input type="range" min={10} max={60} className="w-full" value={element.widthPct} onChange={(e) => onChange({ widthPct: Number(e.target.value) } as never)} />
        </div>
      )
    case 'signature':
      return (
        <div>
          <span className={LABEL}>संरेखण</span>
          <AlignPicker value={element.align} onChange={(align) => onChange({ align } as never)} />
        </div>
      )
    case 'keyvalue':
      return (
        <div className="space-y-3">
          <div>
            <span className={LABEL}>लेबल</span>
            <input className={FIELD} value={element.label} onChange={(e) => onChange({ label: e.target.value } as never)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={element.underline} onChange={(e) => onChange({ underline: e.target.checked } as never)} />
            रेखांकित करें
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={element.inline} onChange={(e) => onChange({ inline: e.target.checked } as never)} />
            एक पंक्ति में दिखाएं
          </label>
        </div>
      )
    case 'date':
      return (
        <div>
          <span className={LABEL}>लेबल</span>
          <input className={FIELD} value={element.label} onChange={(e) => onChange({ label: e.target.value } as never)} />
        </div>
      )
    case 'line':
      return (
        <div>
          <span className={LABEL}>शैली</span>
          <select className={FIELD} value={element.style} onChange={(e) => onChange({ style: e.target.value } as never)}>
            <option value="solid">सामान्य</option>
            <option value="dashed">डैश</option>
            <option value="double">डबल</option>
          </select>
        </div>
      )
    case 'spacer':
      return (
        <div>
          <span className={LABEL}>ऊंचाई (px)</span>
          <input type="number" className={FIELD} value={element.heightPx} onChange={(e) => onChange({ heightPx: Number(e.target.value) } as never)} />
        </div>
      )
    case 'list':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={element.ordered} onChange={(e) => onChange({ ordered: e.target.checked } as never)} />
          क्रमांकित सूची
        </label>
      )
    case 'table':
      return (
        <div className="text-xs text-slate-500">तालिका के लिए विकल्प तालिका के ऊपर टूलबार में उपलब्ध हैं।</div>
      )
    default:
      return null
  }
}

export default function PropertiesPanel({ doc, selectedElement, onDocChange, onElementChange }: PropertiesPanelProps) {
  return (
    <div className="p-3 space-y-5">
      {selectedElement && (
        <section>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">तत्व गुण</h3>
          <ElementProps element={selectedElement} onChange={onElementChange} />
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">पेज सेटिंग</h3>
        <div className="space-y-3">
          <div>
            <span className={LABEL}>पेज आकार</span>
            <select className={FIELD} value={doc.pageSize} onChange={(e) => onDocChange({ pageSize: e.target.value as never })}>
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
          <div>
            <span className={LABEL}>अभिविन्यास</span>
            <div className="flex gap-1">
              <button className={`flex-1 py-1 text-xs rounded border ${doc.orientation === 'portrait' ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`} onClick={() => onDocChange({ orientation: 'portrait' })}>पोर्ट्रेट</button>
              <button className={`flex-1 py-1 text-xs rounded border ${doc.orientation === 'landscape' ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200'}`} onClick={() => onDocChange({ orientation: 'landscape' })}>लैंडस्केप</button>
            </div>
          </div>
          <div>
            <span className={LABEL}>सीमा (Border)</span>
            <select className={FIELD} value={doc.border} onChange={(e) => onDocChange({ border: e.target.value as never })}>
              <option value="none">बिना सीमा</option>
              <option value="thin">पतली सीमा</option>
              <option value="double">डबल सीमा</option>
              <option value="gov">सरकारी शैली</option>
            </select>
          </div>
          <div>
            <span className={LABEL}>मार्जिन (mm)</span>
            <div className="grid grid-cols-2 gap-2">
              {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                <label key={side} className="text-xs text-slate-500">
                  {side === 'top' ? 'ऊपर' : side === 'bottom' ? 'नीचे' : side === 'left' ? 'बाएं' : 'दाएं'}
                  <input
                    type="number"
                    className={FIELD}
                    value={doc.margins[side]}
                    onChange={(e) => onDocChange({ margins: { ...doc.margins, [side]: Number(e.target.value) } })}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">हेडर सेटिंग</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={doc.header.visible} onChange={(e) => onDocChange({ header: { ...doc.header, visible: e.target.checked } })} />
            हेडर दिखाएं
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={doc.header.showOnEveryPage} onChange={(e) => onDocChange({ header: { ...doc.header, showOnEveryPage: e.target.checked } })} />
            हर पेज पर दिखाएं
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={doc.header.showSchoolLogo} onChange={(e) => onDocChange({ header: { ...doc.header, showSchoolLogo: e.target.checked } })} />
            विद्यालय लोगो
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={doc.header.showGovtLogo} onChange={(e) => onDocChange({ header: { ...doc.header, showGovtLogo: e.target.checked } })} />
            शासकीय चिन्ह
          </label>
          <textarea
            className={FIELD + ' min-h-[90px]'}
            value={doc.header.html}
            onChange={(e) => onDocChange({ header: { ...doc.header, html: e.target.value } })}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">दस्तावेज़ फ़ील्ड / चर के मान</h3>
        <div className="space-y-2">
          {extractUsedVariables(doc).length === 0 && (
            <p className="text-xs text-slate-400">
              दस्तावेज़ में अभी कोई {'{{'}चर{'}}'} उपयोग नहीं हुआ है। टेक्स्ट टूलबार से {'{{ }}'} चर बटन द्वारा जोड़ें।
            </p>
          )}
          {extractUsedVariables(doc).map((key) => {
            const def = VARIABLE_DEFS.find((v) => v.key === key)
            return (
              <label key={key} className="text-xs text-slate-500 block">
                {def ? def.label : key} <span className="font-mono text-slate-400">{'{{' + key + '}}'}</span>
                <input
                  className={FIELD}
                  value={doc.fields[key] || ''}
                  placeholder="मान भरें (रिक्त होने पर विद्यालय सेटिंग से स्वतः भर सकता है)"
                  onChange={(e) => onDocChange({ fields: { ...doc.fields, [key]: e.target.value } })}
                />
              </label>
            )
          })}
        </div>
      </section>
    </div>
  )
}
