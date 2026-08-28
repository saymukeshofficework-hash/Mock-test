import { Link } from 'react-router-dom'
import type { ClassInfo } from '../data/types'
import Icon from './Icon'

export default function ClassCard({ cls }: { cls: ClassInfo }) {
  return (
    <Link
      to={`/classes/${cls.slug}`}
      className="card group flex flex-col gap-3 p-5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-lg font-bold text-white dark:bg-cyan-400 dark:text-navy-950">
          {cls.numeral}
        </span>
        <Icon name="arrowRight" className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-brand-600 dark:text-navy-600 dark:group-hover:text-cyan-400" />
      </div>
      <h3 className="text-base font-bold text-navy-900 dark:text-white">{cls.label}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{cls.description}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {cls.boards.map((b) => (
          <span key={b} className="badge bg-slate-100 text-slate-600 dark:bg-navy-700 dark:text-slate-300">
            {b}
          </span>
        ))}
      </div>
    </Link>
  )
}
