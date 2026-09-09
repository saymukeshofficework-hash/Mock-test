import { useRef } from 'react'
import type { SignatureElement, SignatureSlot } from '../../types/document'
import { uid } from '../../utils/id'
import { getSchoolSettings } from '../../storage/schoolSettingsRepo'
import { todayFormatted } from '../../utils/date'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function SlotView({
  slot,
  readOnly,
  onChange,
  onRemove,
  removable,
}: {
  slot: SignatureSlot
  readOnly: boolean
  onChange: (patch: Partial<SignatureSlot>) => void
  onRemove: () => void
  removable: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-col items-center text-center min-w-[160px] px-2">
      <div className="h-14 flex items-end justify-center mb-1">
        {slot.imageSrc ? (
          <img src={slot.imageSrc} alt="हस्ताक्षर" className="max-h-14 object-contain" />
        ) : (
          !readOnly && <span className="text-xs text-slate-300">हस्ताक्षर छवि</span>
        )}
      </div>
      <div className="border-t border-black w-full pt-1 text-sm">
        {readOnly ? (
          <>
            <div>{slot.name || ' '}</div>
            <div className="font-medium">{slot.designation}</div>
            {slot.mobile && <div className="text-xs">{slot.mobile}</div>}
          </>
        ) : (
          <div className="space-y-1">
            <input
              className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-brand-500 outline-none text-sm"
              placeholder="नाम"
              value={slot.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
            <input
              className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-brand-500 outline-none text-sm font-medium"
              placeholder="पद (जैसे प्रधानाध्यापक)"
              value={slot.designation}
              onChange={(e) => onChange({ designation: e.target.value })}
            />
            <input
              className="w-full text-center border-b border-transparent hover:border-slate-200 focus:border-brand-500 outline-none text-xs"
              placeholder="मोबाइल नंबर"
              value={slot.mobile}
              onChange={(e) => onChange({ mobile: e.target.value })}
            />
          </div>
        )}
      </div>
      {!readOnly && (
        <div className="no-print flex items-center gap-2 mt-1 text-xs">
          <button className="text-brand-600 hover:underline" onClick={() => inputRef.current?.click()}>
            हस्ताक्षर अपलोड
          </button>
          {slot.imageSrc && (
            <button className="text-slate-500 hover:underline" onClick={() => onChange({ imageSrc: undefined })}>
              हटाएं
            </button>
          )}
          {removable && (
            <button className="text-red-500 hover:underline" onClick={onRemove}>
              स्लॉट हटाएं
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) onChange({ imageSrc: await fileToDataUrl(file) })
            }}
          />
        </div>
      )}
    </div>
  )
}

export default function SignatureBlockView({
  element,
  readOnly,
  onChange,
}: {
  element: SignatureElement
  readOnly: boolean
  onChange: (patch: Partial<SignatureElement>) => void
}) {
  const settings = getSchoolSettings()
  const justify = element.align === 'center' ? 'center' : element.align === 'left' ? 'flex-start' : 'space-between'

  return (
    <div className="mt-4">
      {(element.showDate || element.showPlace) && (
        <div className="flex gap-6 mb-3 text-sm">
          {element.showPlace && (
            <div>
              <span className="font-medium">स्थान:</span> {settings.default_place}
            </div>
          )}
          {element.showDate && (
            <div>
              <span className="font-medium">दिनांक:</span> {todayFormatted(settings.date_format)}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap gap-4" style={{ justifyContent: justify }}>
        {element.slots.map((slot, idx) => (
          <SlotView
            key={slot.id}
            slot={slot}
            readOnly={readOnly}
            removable={element.slots.length > 1}
            onChange={(patch) => {
              const slots = element.slots.map((s, i) => (i === idx ? { ...s, ...patch } : s))
              onChange({ slots })
            }}
            onRemove={() => onChange({ slots: element.slots.filter((_, i) => i !== idx) })}
          />
        ))}
      </div>
      {!readOnly && (
        <div className="no-print mt-2 flex items-center gap-3 text-xs">
          <button
            className="text-brand-600 hover:underline"
            onClick={() =>
              onChange({
                slots: [...element.slots, { id: uid('sig'), name: '', designation: 'सचिव', mobile: '' }],
              })
            }
          >
            + हस्ताक्षर स्लॉट जोड़ें
          </button>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={element.showDate} onChange={(e) => onChange({ showDate: e.target.checked })} />
            दिनांक दिखाएं
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={element.showPlace} onChange={(e) => onChange({ showPlace: e.target.checked })} />
            स्थान दिखाएं
          </label>
        </div>
      )}
    </div>
  )
}
