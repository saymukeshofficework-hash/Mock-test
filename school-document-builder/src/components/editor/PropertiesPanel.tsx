import { useState } from 'react'
import type { Align, DocumentElement, SchoolDocument } from '../../types/document'
import { VARIABLE_DEFS, extractUsedVariables, parseFieldPaste } from '../../utils/variables'
import { applySmartPaste } from '../../utils/smartPaste'
import { SEAL_SIZE_PRESETS } from '../elements/MiscElements'

interface PropertiesPanelProps {
  doc: SchoolDocument
  selectedElement: DocumentElement | null
  onDocChange: (patch: Partial<SchoolDocument>) => void
  onDocPatchFn: (fn: (doc: SchoolDocument) => Partial<SchoolDocument>) => void
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

const CHATGPT_PROMPT = `आप एक सरकारी विद्यालय के लिए पत्र, सूचना और रिपोर्ट लिखने में मदद करने वाले सहायक हैं।

मुझे जो भी पत्र चाहिए, उसका पूरा जवाब हमेशा नीचे दिए गए ठीक इसी प्रारूप में दें। इसके अलावा कोई अतिरिक्त वाक्य, नंबरिंग या स्टार (**) न जोड़ें:

[HEADER]
(पत्र के ऊपर का भाग — कार्यालय का नाम, दिनांक, क्रमांक — हर बात नई लाइन पर)

[MATTER]
(पत्र का पूरा मुख्य पाठ — प्रति, विषय, संबोधन, पैराग्राफ — हर पैराग्राफ के बाद एक खाली लाइन छोड़ें)

[TABLE]
(तालिका ज़रूरी हो तभी लिखें — पहली पंक्ति में कॉलम के नाम, बाकी में डेटा, हर कॉलम को कॉमा से अलग करें)

(तालिका के बाद बचा पत्र — जैसे "भवदीय," और हस्ताक्षर — एक खाली लाइन के बाद जारी रखें)

नोट: तालिका न चाहिए हो तो [TABLE] बिलकुल मत लिखें।

अब मेरा पत्र यह है: [यहाँ अपनी ज़रूरत लिखें — जैसे "खेल दिवस हेतु कक्षावार छात्र संख्या भेजने का पत्र बनाओ"]`

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.focus()
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

function SmartPasteBox({
  doc,
  onApply,
}: {
  doc: SchoolDocument
  onApply: (fn: (doc: SchoolDocument) => Partial<SchoolDocument>) => void
}) {
  const [text, setText] = useState('')
  const [summary, setSummary] = useState<string | null>(null)
  const [promptCopied, setPromptCopied] = useState<'idle' | 'copied' | 'failed'>('idle')

  function apply(source: string) {
    // Summary message only — fine if `doc` is a render behind, it only reports which
    // [SECTION] tags were found in the pasted text, not anything about current content.
    const preview = applySmartPaste(doc, source)
    const parts: string[] = []
    if (preview.filledHeader) parts.push('हेडर')
    if (preview.filledMatter) parts.push('मैटर')
    if (preview.filledTableRows > 0) parts.push(`तालिका (${preview.filledTableRows} पंक्तियाँ)`)
    setSummary(parts.length > 0 ? `${parts.join(', ')} भर दिया गया ✓` : 'कोई [HEADER]/[MATTER]/[TABLE] सेक्शन नहीं मिला')

    // The actual mutation always runs against whatever doc is current at the moment
    // React applies this update (not whatever this component last rendered with), so
    // a stray double-invoke (double paste, a click racing the paste's own auto-apply,
    // etc.) can never duplicate content — a second run just replaces the first run's
    // result again instead of piling another copy on top of it.
    onApply((latestDoc) => {
      const res = applySmartPaste(latestDoc, source)
      const patch: Partial<SchoolDocument> = {}
      if (res.header) patch.header = res.header
      if (res.elements) patch.elements = res.elements
      return patch
    })
  }

  return (
    <div className="border border-dashed border-brand-300 bg-brand-50 rounded-lg p-2 space-y-1.5">
      <p className="text-xs text-slate-600">
        [HEADER], [MATTER], [TABLE] सेक्शन वाला पूरा डेटा यहाँ पेस्ट करें — हेडर, मुख्य पाठ और तालिका सभी एक साथ भर
        जाएंगे (तालिका न हो तो नई बन जाएगी)।
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-2.5 py-1 rounded border border-brand-300 bg-white text-brand-700 text-xs font-medium hover:bg-brand-100"
          onClick={async () => {
            const ok = await copyToClipboard(CHATGPT_PROMPT)
            setPromptCopied(ok ? 'copied' : 'failed')
            setTimeout(() => setPromptCopied('idle'), 2000)
          }}
        >
          ChatGPT प्रॉम्प्ट कॉपी करें
        </button>
        {promptCopied === 'copied' && <span className="text-xs text-green-600">कॉपी हो गया ✓ — अब ChatGPT में पेस्ट करें</span>}
        {promptCopied === 'failed' && <span className="text-xs text-amber-600">कॉपी नहीं हो सका, टेक्स्ट चुनकर मैन्युअल कॉपी करें</span>}
      </div>
      <textarea
        className="w-full border border-slate-200 rounded px-2 py-1 text-xs min-h-[90px] font-mono bg-white"
        placeholder={'[HEADER]\nकार्यालय प्रधानाध्यापक, ...\n\n[MATTER]\nयह सूचित किया जाता है कि...\n\n[TABLE]\nकक्षा\tबालक\tबालिका\nकक्षा 1\t18\t16'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text')
          if (!pasted) return
          setText(pasted)
          setTimeout(() => apply(pasted), 0)
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-brand-600 text-white text-xs font-medium hover:bg-brand-700"
          onClick={() => apply(text)}
        >
          सब भरें
        </button>
        {summary && <span className="text-xs text-green-600">{summary}</span>}
      </div>
    </div>
  )
}

function PasteFillBox({ onFill }: { onFill: (values: Record<string, string>) => void }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState<number | null>(null)

  function apply(source: string) {
    const values = parseFieldPaste(source)
    const count = Object.keys(values).length
    if (count > 0) onFill(values)
    setResult(count)
  }

  return (
    <div className="border border-dashed border-brand-300 bg-brand-50 rounded-lg p-2 space-y-1.5">
      <p className="text-xs text-slate-600">
        डेटा यहाँ पेस्ट करें (Excel की दो कॉलम या "लेबल: मान" पंक्तियाँ) — मिलान वाली फ़ील्ड स्वतः भर जाएंगी।
      </p>
      <textarea
        className="w-full border border-slate-200 rounded px-2 py-1 text-xs min-h-[64px] font-mono bg-white"
        placeholder={'विद्यालय का नाम: ...\nदिनांक: ...\nविद्यार्थी का नाम: ...'}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={(e) => {
          const pasted = e.clipboardData.getData('text')
          if (!pasted) return
          setText(pasted)
          setTimeout(() => apply(pasted), 0)
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-brand-600 text-white text-xs font-medium hover:bg-brand-700"
          onClick={() => apply(text)}
        >
          फ़ील्ड भरें
        </button>
        {result !== null &&
          (result > 0 ? (
            <span className="text-xs text-green-600">{result} फ़ील्ड भरी गईं ✓</span>
          ) : (
            <span className="text-xs text-amber-600">कोई मिलान फ़ील्ड नहीं मिली</span>
          ))}
      </div>
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
        <div className="space-y-3">
          <div>
            <span className={LABEL}>स्थान (Placement)</span>
            <AlignPicker value={element.align} onChange={(align) => onChange({ align } as never)} />
          </div>
          <div>
            <span className={LABEL}>आकार (%)</span>
            <div className="flex gap-1 mb-2">
              {SEAL_SIZE_PRESETS.map(({ label, value }) => (
                <button
                  key={label}
                  className={`flex-1 py-1 text-xs rounded border ${element.widthPct === value ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => onChange({ widthPct: value } as never)}
                >
                  {label}
                </button>
              ))}
            </div>
            <input type="range" min={10} max={60} className="w-full" value={element.widthPct} onChange={(e) => onChange({ widthPct: Number(e.target.value) } as never)} />
          </div>
          <div>
            <span className={LABEL}>ऊर्ध्वाधर स्थिति (px)</span>
            <input
              type="range"
              min={-60}
              max={60}
              className="w-full"
              value={element.offsetTopPx ?? 0}
              onChange={(e) => onChange({ offsetTopPx: Number(e.target.value) } as never)}
            />
          </div>
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

export default function PropertiesPanel({ doc, selectedElement, onDocChange, onDocPatchFn, onElementChange }: PropertiesPanelProps) {
  return (
    <div className="p-3 space-y-5">
      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">स्मार्ट पेस्ट (पूरा डेटा एक साथ भरें)</h3>
        <SmartPasteBox doc={doc} onApply={onDocPatchFn} />
      </section>

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
          <p className="text-xs text-slate-400">
            हेडर टेक्स्ट को सीधे पेज पर क्लिक करके संपादित करें — बोल्ड, फॉन्ट, आकार आदि विकल्प वहाँ टूलबार में उपलब्ध हैं।
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">दस्तावेज़ फ़ील्ड / चर के मान</h3>
        <div className="space-y-2">
          <PasteFillBox onFill={(values) => onDocChange({ fields: { ...doc.fields, ...values } })} />
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
