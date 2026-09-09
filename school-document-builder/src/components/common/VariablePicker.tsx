import Modal from './Modal'
import { VARIABLE_DEFS } from '../../utils/variables'

interface VariablePickerProps {
  onPick: (key: string) => void
  onClose: () => void
}

export default function VariablePicker({ onPick, onClose }: VariablePickerProps) {
  return (
    <Modal title="चर जोड़ें (Insert Variable)" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        {VARIABLE_DEFS.map((v) => (
          <button
            key={v.key}
            className="text-left border border-slate-200 rounded-lg px-3 py-2 hover:border-brand-500 hover:bg-brand-50 transition"
            onClick={() => {
              onPick(v.key)
              onClose()
            }}
          >
            <div className="text-xs text-slate-500 font-mono">{'{{' + v.key + '}}'}</div>
            <div className="text-sm text-slate-800">{v.label}</div>
          </button>
        ))}
      </div>
    </Modal>
  )
}
