import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
import PriceTag from '../components/PriceTag'
import EnrollmentCTA from '../components/EnrollmentCTA'
import NotFound from './NotFound'
import { getOnlineClass } from '../data/onlineClasses'
import { getClass } from '../data/classes'

const rows: { key: keyof NonNullable<ReturnType<typeof getOnlineClass>>; label: string }[] = [
  { key: 'teacher', label: 'Teacher' },
  { key: 'days', label: 'Days' },
  { key: 'time', label: 'Time' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'duration', label: 'Duration' },
  { key: 'mode', label: 'Mode' },
]

export default function OnlineClassDetail() {
  const { slug = '' } = useParams()
  const oc = getOnlineClass(slug)
  if (!oc) return <NotFound />
  const cls = getClass(oc.classSlug)

  return (
    <>
      <SEO title={oc.title} description={oc.description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Online Classes', to: '/online-classes' }, { label: oc.title }]} />
      <div className="container-page py-14 pb-24 sm:pb-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="green">Live / Online</Badge>
              {cls && <Badge tone="brand">{cls.label}</Badge>}
              <Badge>{oc.board}</Badge>
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{oc.title}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{oc.description}</p>

            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {rows.map(({ key, label }) =>
                oc[key] ? (
                  <div key={key} className="card p-4">
                    <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
                    <dd className="mt-1 text-sm font-medium text-navy-800 dark:text-slate-100">{String(oc[key])}</dd>
                  </div>
                ) : null,
              )}
            </dl>
          </div>

          <div className="card border-emerald-400/20 p-6">
            <PriceTag pricing={oc} size="lg" suffix={oc.priceType ? `/${oc.priceType}` : undefined} />
            {oc.registrationFee !== undefined && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Plus a one-time registration fee — details shared on WhatsApp.</p>
            )}
            <div className="mt-4">
              <EnrollmentCTA kind="onlineClass" data={oc} status={oc.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-navy-700 dark:bg-navy-900/95 sm:hidden">
        <PriceTag pricing={oc} size="sm" suffix={oc.priceType ? `/${oc.priceType}` : undefined} />
        <EnrollmentCTA kind="onlineClass" data={oc} status={oc.status} compact />
      </div>
    </>
  )
}
