import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  widthClass?: string
}

export default function Modal({ title, onClose, children, widthClass = 'max-w-lg' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`bg-white rounded-xl shadow-2xl w-full ${widthClass} max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
