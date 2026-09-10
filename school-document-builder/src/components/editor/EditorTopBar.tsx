import { Link } from 'react-router-dom'

interface EditorTopBarProps {
  name: string
  onNameChange: (name: string) => void
  saveStatus: 'saved' | 'saving' | 'idle'
  onPreview: () => void
  onSave: () => void
  onSaveAsTemplate: () => void
}

export default function EditorTopBar({ name, onNameChange, saveStatus, onPreview, onSave, onSaveAsTemplate }: EditorTopBarProps) {
  return (
    <header className="no-print bg-white border-b border-slate-200 flex items-center gap-2 px-3 py-2 flex-wrap shrink-0">
      <Link to="/" className="text-slate-400 hover:text-slate-700 text-sm shrink-0">
        ← डैशबोर्ड
      </Link>
      <input
        className="font-semibold text-slate-800 border border-transparent hover:border-slate-200 focus:border-brand-500 rounded px-2 py-1 outline-none text-sm w-28 sm:min-w-[160px] sm:w-auto"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <span className="text-xs text-slate-400 hidden sm:inline">
        {saveStatus === 'saving' ? 'सहेजा जा रहा है...' : saveStatus === 'saved' ? 'सहेजा गया ✓' : ''}
      </span>
      <div className="flex-1 hidden sm:block" />
      <div className="flex items-center gap-2 flex-wrap ml-auto sm:ml-0">
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
        >
          सहेजें
        </button>
        <button
          onClick={onSaveAsTemplate}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50"
        >
          टेम्पलेट के रूप में सहेजें
        </button>
        <button
          onClick={onPreview}
          className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
        >
          पूर्वावलोकन / PDF
        </button>
      </div>
    </header>
  )
}
