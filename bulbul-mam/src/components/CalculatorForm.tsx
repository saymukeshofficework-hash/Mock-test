import { FormEvent, ReactNode } from 'react'

interface Props {
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  submitLabel: string
}

export default function CalculatorForm({ onSubmit, children, submitLabel }: Props) {
  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8" noValidate>
      {children}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export function CalculatorField({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy-900">
        {label}
      </label>
      {children}
    </div>
  )
}

export const calculatorInputClass =
  'rounded-xl border border-navy-900/15 px-4 py-2.5 text-sm focus:border-rose-500 focus:outline-none'
