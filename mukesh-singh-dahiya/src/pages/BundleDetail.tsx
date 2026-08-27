import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Badge from '../components/Badge'
import PriceTag from '../components/PriceTag'
import EnrollmentCTA from '../components/EnrollmentCTA'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { getBundle } from '../data/bundles'
import { getClass } from '../data/classes'

export default function BundleDetail() {
  const { slug = '' } = useParams()
  const bundle = getBundle(slug)
  if (!bundle) return <NotFound />
  const cls = bundle.classSlug ? getClass(bundle.classSlug) : undefined

  return (
    <>
      <SEO title={bundle.title} description={bundle.description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bundles', to: '/bundles' }, { label: bundle.title }]} />
      <div className="container-page py-14 pb-24 sm:pb-16">
        <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <Badge tone="gold">Bundle</Badge>
              {cls && <Badge tone="brand">{cls.label}</Badge>}
              {bundle.board && <Badge>{bundle.board}</Badge>}
            </div>
            <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{bundle.title}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{bundle.description}</p>

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-bold text-navy-900 dark:text-white">What's Included</h2>
              <ul className="space-y-2">
                {bundle.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-navy-700 dark:text-slate-200">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="card border-gold-400/20 p-6">
            <PriceTag pricing={bundle} size="lg" />
            <div className="mt-4">
              <EnrollmentCTA kind="bundle" data={bundle} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-navy-700 dark:bg-navy-900/95 sm:hidden">
        <PriceTag pricing={bundle} size="sm" />
        <EnrollmentCTA kind="bundle" data={bundle} compact />
      </div>
    </>
  )
}
