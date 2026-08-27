import { useState } from 'react'
import Icon from './Icon'

export interface FilterOption {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export default function FilterBar({
  filters,
  values,
  onChange,
  onReset,
}: {
  filters: FilterOption[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset: () => void
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeCount = Object.values(values).filter(Boolean).length

  const controls = (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {filters.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{f.label}</label>
          <select
            className="input"
            value={values[f.key] ?? ''}
            onChange={(e) => onChange(f.key, e.target.value)}
          >
            <option value="">All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )

  return (
    <div className="card mb-8 p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between sm:hidden">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-navy-800 dark:text-slate-100"
        >
          <Icon name="filter" className="h-4 w-4" />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs font-semibold text-brand-600 dark:text-cyan-400">
            Reset
          </button>
        )}
      </div>
      <div className={`${mobileOpen ? 'block' : 'hidden'} sm:block`}>
        {controls}
        {activeCount > 0 && (
          <button onClick={onReset} className="mt-3 hidden text-xs font-semibold text-brand-600 dark:text-cyan-400 sm:inline-block">
            Reset filters
          </button>
        )}
      </div>
    </div>
  )
}
