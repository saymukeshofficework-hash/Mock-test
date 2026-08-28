import { Link } from 'react-router-dom'
import type { CalculatorConfig } from '../data/types'
import Icon from './Icon'

export default function CalculatorCard({ calc }: { calc: CalculatorConfig }) {
  return (
    <Link
      to={`/calculators/${calc.slug}`}
      className="card flex flex-col gap-3 p-5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
        <Icon name="calc" className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-navy-900 dark:text-white">{calc.title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{calc.description}</p>
    </Link>
  )
}
