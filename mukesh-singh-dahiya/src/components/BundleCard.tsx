import { Link } from 'react-router-dom'
import type { Bundle } from '../data/types'
import Badge from './Badge'
import PriceTag from './PriceTag'
import { getClass } from '../data/classes'

export default function BundleCard({ bundle }: { bundle: Bundle }) {
  const cls = bundle.classSlug ? getClass(bundle.classSlug) : undefined
  return (
    <Link to={`/bundles/${bundle.slug}`} className="card flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="gold">Bundle</Badge>
        {cls && <Badge>{cls.label}</Badge>}
        {bundle.board && <Badge>{bundle.board}</Badge>}
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{bundle.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{bundle.description}</p>
      <p className="text-xs text-slate-400 dark:text-slate-500">{bundle.includes.join(' · ')}</p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-navy-700">
        <PriceTag pricing={bundle} />
        <span className="text-sm font-semibold text-brand-600 dark:text-cyan-400">View →</span>
      </div>
    </Link>
  )
}
