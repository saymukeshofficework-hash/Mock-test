import { useRef } from 'react'
import type {
  CheckboxElement,
  DateElement,
  ImageElement,
  KeyValueElement,
  LineElement,
  ListElement,
  SpacerElement,
  StampElement,
} from '../../types/document'
import { formatDate, todayFormatted } from '../../utils/date'
import { getSchoolSettings } from '../../storage/schoolSettingsRepo'
import { uid } from '../../utils/id'

export const SEAL_SIZE_PRESETS: { label: string; value: number }[] = [
  { label: 'छोटा', value: 15 },
  { label: 'मध्यम', value: 25 },
  { label: 'बड़ा', value: 40 },
]

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ImageBlock({
  element,
  readOnly,
  onChange,
}: {
  element: ImageElement
  readOnly: boolean
  onChange: (patch: Partial<ImageElement>) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div style={{ textAlign: element.align }}>
      {element.src ? (
        <img
          src={element.src}
          alt={element.caption || 'चित्र'}
          style={{ width: `${element.widthPct}%`, display: 'inline-block' }}
        />
      ) : (
        !readOnly && (
          <div className="border-2 border-dashed border-slate-300 rounded p-8 text-center text-slate-400 text-sm">
            चित्र अपलोड नहीं किया गया
          </div>
        )
      )}
      {!readOnly && (
        <div className="no-print mt-1 flex items-center gap-2 justify-center text-xs">
          <button
            className="px-2 py-1 border rounded hover:bg-slate-50"
            onClick={() => inputRef.current?.click()}
          >
            चित्र चुनें
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) onChange({ src: await fileToDataUrl(file) })
            }}
          />
          <label>
            चौड़ाई:
            <input
              type="range"
              min={10}
              max={100}
              value={element.widthPct}
              onChange={(e) => onChange({ widthPct: Number(e.target.value) })}
              className="align-middle ml-1"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export function StampBlock({
  element,
  readOnly,
  onChange,
}: {
  element: StampElement
  readOnly: boolean
  onChange: (patch: Partial<StampElement>) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div style={{ textAlign: element.align }}>
      {element.src ? (
        <img
          src={element.src}
          alt="मुहर"
          style={{ width: `${element.widthPct}%`, display: 'inline-block', marginTop: element.offsetTopPx ?? 0 }}
        />
      ) : (
        !readOnly && (
          <div className="border-2 border-dashed border-slate-300 rounded p-4 text-center text-slate-400 text-xs w-40 mx-auto">
            मुहर/सील चित्र
          </div>
        )
      )}
      {!readOnly && (
        <div className="no-print mt-1 flex flex-wrap items-center gap-3 justify-center text-xs">
          <button className="px-2 py-1 border rounded hover:bg-slate-50" onClick={() => inputRef.current?.click()}>
            मुहर अपलोड करें
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) onChange({ src: await fileToDataUrl(file) })
            }}
          />
          <div className="flex items-center border rounded overflow-hidden">
            <button
              className={`px-2 py-1 ${element.align === 'left' ? 'bg-brand-600 text-white' : 'hover:bg-slate-50'}`}
              onClick={() => onChange({ align: 'left' })}
            >
              बाएं
            </button>
            <button
              className={`px-2 py-1 border-l ${element.align === 'center' ? 'bg-brand-600 text-white' : 'hover:bg-slate-50'}`}
              onClick={() => onChange({ align: 'center' })}
            >
              मध्य
            </button>
            <button
              className={`px-2 py-1 border-l ${element.align === 'right' ? 'bg-brand-600 text-white' : 'hover:bg-slate-50'}`}
              onClick={() => onChange({ align: 'right' })}
            >
              दाएं
            </button>
          </div>
          <div className="flex items-center border rounded overflow-hidden">
            {SEAL_SIZE_PRESETS.map(({ label, value }) => (
              <button
                key={label}
                className={`px-2 py-1 first:border-l-0 border-l ${element.widthPct === value ? 'bg-brand-600 text-white' : 'hover:bg-slate-50'}`}
                onClick={() => onChange({ widthPct: value })}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-1">
            आकार
            <input
              type="range"
              min={10}
              max={60}
              value={element.widthPct}
              onChange={(e) => onChange({ widthPct: Number(e.target.value) })}
              className="align-middle"
            />
          </label>
          <label className="flex items-center gap-1">
            स्थान (ऊपर-नीचे)
            <input
              type="range"
              min={-60}
              max={60}
              value={element.offsetTopPx ?? 0}
              onChange={(e) => onChange({ offsetTopPx: Number(e.target.value) })}
              className="align-middle"
            />
          </label>
          {(element.offsetTopPx ?? 0) !== 0 && (
            <button className="text-brand-600 hover:underline" onClick={() => onChange({ offsetTopPx: 0 })}>
              रीसेट
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function KeyValueBlock({
  element,
  readOnly,
  onChange,
}: {
  element: KeyValueElement
  readOnly: boolean
  onChange: (patch: Partial<KeyValueElement>) => void
}) {
  return (
    <div className={`flex gap-2 items-baseline ${element.inline ? '' : 'flex-col'}`} style={{ justifyContent: element.align === 'center' ? 'center' : element.align === 'right' ? 'flex-end' : 'flex-start' }}>
      <span className="font-medium whitespace-nowrap">{element.label}:</span>
      {readOnly ? (
        <span className={element.underline ? 'border-b border-black min-w-[120px] inline-block px-1' : ''}>{element.value}</span>
      ) : (
        <input
          className={`bg-transparent px-1 outline-none ${element.underline ? 'border-b border-black' : ''}`}
          value={element.value}
          placeholder="मान भरें"
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}
    </div>
  )
}

export function DateBlock({
  element,
  readOnly,
  onChange,
}: {
  element: DateElement
  readOnly: boolean
  onChange: (patch: Partial<DateElement>) => void
}) {
  const settings = getSchoolSettings()
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(element.value)
  const display = element.useToday
    ? todayFormatted(settings.date_format)
    : isoMatch
      ? formatDate(new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])), settings.date_format)
      : element.value
  return (
    <div style={{ textAlign: element.align }} className="flex items-center gap-2 justify-start">
      <span className="font-medium">{element.label}:</span>
      {readOnly ? (
        <span className="border-b border-black px-2">{display}</span>
      ) : element.useToday ? (
        <span className="border-b border-black px-2 text-slate-600">{display} (आज)</span>
      ) : (
        <input
          type="date"
          className="border rounded px-1 py-0.5 text-sm"
          value={element.value}
          onChange={(e) => onChange({ value: e.target.value })}
        />
      )}
      {!readOnly && (
        <label className="no-print text-xs text-slate-500 flex items-center gap-1 ml-2">
          <input type="checkbox" checked={element.useToday} onChange={(e) => onChange({ useToday: e.target.checked })} />
          आज की दिनांक उपयोग करें
        </label>
      )}
    </div>
  )
}

export function LineBlock({ element }: { element: LineElement }) {
  const style =
    element.style === 'double'
      ? '4px double #333'
      : element.style === 'dashed'
        ? '1.5px dashed #333'
        : '1.5px solid #333'
  return <hr style={{ border: 'none', borderTop: style, margin: '8px 0' }} />
}

export function SpacerBlock({ element, readOnly }: { element: SpacerElement; readOnly: boolean }) {
  return (
    <div style={{ height: element.heightPx }} className={readOnly ? '' : 'border border-dashed border-slate-200 rounded'} />
  )
}

export function PageBreakBlock({ readOnly }: { readOnly: boolean }) {
  if (readOnly) return null
  return (
    <div className="no-print flex items-center gap-2 my-2 text-slate-400 text-xs">
      <div className="flex-1 border-t-2 border-dashed border-slate-300" />
      पेज ब्रेक
      <div className="flex-1 border-t-2 border-dashed border-slate-300" />
    </div>
  )
}

export function CheckboxBlock({
  element,
  readOnly,
  onChange,
}: {
  element: CheckboxElement
  readOnly: boolean
  onChange: (patch: Partial<CheckboxElement>) => void
}) {
  return (
    <div className="space-y-1">
      {element.items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.checked}
            disabled={readOnly}
            onChange={(e) =>
              onChange({
                items: element.items.map((it) => (it.id === item.id ? { ...it, checked: e.target.checked } : it)),
              })
            }
          />
          {readOnly ? (
            <span>{item.text}</span>
          ) : (
            <input
              className="flex-1 border-b border-slate-200 outline-none px-1 focus:border-brand-500"
              value={item.text}
              onChange={(e) =>
                onChange({
                  items: element.items.map((it) => (it.id === item.id ? { ...it, text: e.target.value } : it)),
                })
              }
            />
          )}
          {!readOnly && (
            <button
              className="no-print text-red-400 hover:text-red-600 text-xs"
              onClick={() => onChange({ items: element.items.filter((it) => it.id !== item.id) })}
            >
              हटाएं
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <button
          className="no-print text-xs text-brand-600 hover:underline"
          onClick={() => onChange({ items: [...element.items, { id: uid('chk'), text: 'नया विकल्प', checked: false }] })}
        >
          + विकल्प जोड़ें
        </button>
      )}
    </div>
  )
}

export function ListBlock({
  element,
  readOnly,
  onChange,
}: {
  element: ListElement
  readOnly: boolean
  onChange: (patch: Partial<ListElement>) => void
}) {
  const Tag = element.ordered ? 'ol' : 'ul'
  return (
    <Tag className={element.ordered ? 'list-decimal pl-6' : 'list-disc pl-6'}>
      {element.items.map((item, idx) => (
        <li key={idx} className="mb-0.5">
          {readOnly ? (
            item
          ) : (
            <input
              className="w-full border-b border-transparent hover:border-slate-200 focus:border-brand-500 outline-none px-1"
              value={item}
              onChange={(e) => {
                const items = [...element.items]
                items[idx] = e.target.value
                onChange({ items })
              }}
            />
          )}
        </li>
      ))}
      {!readOnly && (
        <button
          className="no-print text-xs text-brand-600 hover:underline"
          onClick={() => onChange({ items: [...element.items, 'नया बिंदु'] })}
        >
          + बिंदु जोड़ें
        </button>
      )}
    </Tag>
  )
}
