import { Link } from 'react-router-dom'
import Icon from './Icon'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="border-b border-slate-100 bg-slate-50/60 dark:border-navy-800 dark:bg-navy-900/40">
      <div className="container-page flex flex-wrap items-center gap-1 py-3 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <Icon name="chevronRight" className="h-3.5 w-3.5 shrink-0" />}
            {item.to ? (
              <Link to={item.to} className="hover:text-brand-600 dark:hover:text-cyan-400">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-navy-800 dark:text-slate-200">{item.label}</span>
            )}
          </span>
        ))}
      </div>
    </nav>
  )
}
