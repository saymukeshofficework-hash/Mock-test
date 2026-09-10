import { useState } from 'react'
import Modal from '../common/Modal'

export default function SaveAsTemplateModal({
  defaultName,
  onSave,
  onClose,
}: {
  defaultName: string
  onSave: (name: string, description: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(defaultName)
  const [description, setDescription] = useState('')
  return (
    <Modal title="टेम्पलेट के रूप में सहेजें" onClose={onClose}>
      <div className="space-y-3">
        <label className="block text-sm">
          टेम्पलेट नाम
          <input className="w-full border border-slate-200 rounded px-2 py-1.5 mt-1" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="block text-sm">
          विवरण
          <textarea className="w-full border border-slate-200 rounded px-2 py-1.5 mt-1 min-h-[70px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button className="px-4 py-1.5 rounded-lg border border-slate-200 text-sm" onClick={onClose}>
            रद्द करें
          </button>
          <button
            className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium"
            onClick={() => {
              if (!name.trim()) return
              onSave(name.trim(), description.trim())
              onClose()
            }}
          >
            सहेजें
          </button>
        </div>
      </div>
    </Modal>
  )
}
