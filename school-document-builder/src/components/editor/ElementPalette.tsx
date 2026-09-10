import type { DocumentElement } from '../../types/document'

interface PaletteItem {
  kind: DocumentElement['type']
  label: string
  icon: string
}

const GROUPS: { title: string; items: PaletteItem[] }[] = [
  {
    title: 'पाठ',
    items: [
      { kind: 'heading', label: 'शीर्षक', icon: 'H' },
      { kind: 'paragraph', label: 'अनुच्छेद', icon: '¶' },
      { kind: 'list', label: 'सूची', icon: '≡' },
      { kind: 'checkbox', label: 'चेकबॉक्स', icon: '☑' },
    ],
  },
  {
    title: 'संरचना',
    items: [
      { kind: 'table', label: 'तालिका', icon: '▦' },
      { kind: 'line', label: 'क्षैतिज रेखा', icon: '―' },
      { kind: 'spacer', label: 'रिक्त स्थान', icon: '␣' },
      { kind: 'pagebreak', label: 'पेज ब्रेक', icon: '⤓' },
    ],
  },
  {
    title: 'फ़ील्ड',
    items: [
      { kind: 'keyvalue', label: 'क्रमांक/लेबल', icon: '#' },
      { kind: 'date', label: 'दिनांक', icon: '📅' },
    ],
  },
  {
    title: 'मीडिया एवं हस्ताक्षर',
    items: [
      { kind: 'image', label: 'चित्र', icon: '🖼' },
      { kind: 'stamp', label: 'मुहर/सील', icon: '◉' },
      { kind: 'signature', label: 'हस्ताक्षर', icon: '✍' },
    ],
  },
]

export default function ElementPalette({ onAdd }: { onAdd: (kind: DocumentElement['type']) => void }) {
  return (
    <div className="p-3 space-y-4">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5 px-1">
            {group.title}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {group.items.map((item) => (
              <button
                key={item.kind}
                onClick={() => onAdd(item.kind)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg border border-slate-200 hover:border-brand-500 hover:bg-brand-50 text-slate-700 transition text-xs"
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
