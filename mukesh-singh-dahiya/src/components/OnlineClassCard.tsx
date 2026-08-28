import { Link } from 'react-router-dom'
import type { OnlineClass } from '../data/types'
import Badge from './Badge'
import PriceTag from './PriceTag'
import { getClass } from '../data/classes'

const statusTone = {
  'Enrollment Open': 'green',
  'Coming Soon': 'gold',
  'Enrollment Closed': 'slate',
} as const

export default function OnlineClassCard({ oc }: { oc: OnlineClass }) {
  const cls = getClass(oc.classSlug)
  return (
    <Link to={`/online-classes/${oc.slug}`} className="card flex flex-col gap-3 border-l-4 border-l-emerald-500 p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge tone="green">Live / Online</Badge>
        {cls && <Badge>{cls.label}</Badge>}
        <Badge>{oc.board}</Badge>
        <Badge tone={statusTone[oc.status]}>{oc.status}</Badge>
      </div>
      <h3 className="font-bold leading-snug text-navy-900 dark:text-white">{oc.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{oc.description}</p>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
        {oc.days && oc.time ? `${oc.days} · ${oc.time}` : 'Schedule to be announced'}
      </p>
      <div className="mt-auto border-t border-slate-100 pt-3 dark:border-navy-700">
        <PriceTag pricing={oc} suffix={oc.priceType ? `/${oc.priceType}` : undefined} />
      </div>
    </Link>
  )
}
