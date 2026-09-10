import type { ReactNode } from 'react'

interface ElementWrapperProps {
  selected: boolean
  readOnly: boolean
  onSelect: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  children: ReactNode
}

export default function ElementWrapper({
  selected,
  readOnly,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  children,
}: ElementWrapperProps) {
  if (readOnly) return <div>{children}</div>
  return (
    <div
      className={`relative group my-1 rounded ${selected ? 'ring-2 ring-brand-500' : 'hover:ring-1 hover:ring-slate-300'}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {children}
      {selected && (
        <div className="no-print absolute -top-4 right-0 flex items-center gap-0.5 bg-brand-600 text-white rounded shadow px-1 py-0.5 z-10 text-xs">
          <button title="ऊपर ले जाएं" className="px-1.5 py-0.5 hover:bg-brand-500 rounded" onClick={(e) => { e.stopPropagation(); onMoveUp() }}>↑</button>
          <button title="नीचे ले जाएं" className="px-1.5 py-0.5 hover:bg-brand-500 rounded" onClick={(e) => { e.stopPropagation(); onMoveDown() }}>↓</button>
          <button title="प्रतिलिपि" className="px-1.5 py-0.5 hover:bg-brand-500 rounded" onClick={(e) => { e.stopPropagation(); onDuplicate() }}>⎘</button>
          <button title="हटाएं" className="px-1.5 py-0.5 hover:bg-red-500 rounded" onClick={(e) => { e.stopPropagation(); onDelete() }}>🗑</button>
        </div>
      )}
    </div>
  )
}
