import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import BundleCard from '../components/BundleCard'
import EmptyState from '../components/EmptyState'
import { bundles } from '../data/bundles'

export default function Bundles() {
  return (
    <>
      <SEO title="Study Bundles" description="Notes, questions, solutions and revision material bundled together at one price." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Bundles' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Study Bundles</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Notes, questions, solutions and revision material bundled together at one price.</p>
        <div className="mt-10">
          {bundles.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bundles.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
            </div>
          ) : (
            <EmptyState title="No bundles yet" message="Study bundles will be added here soon." />
          )}
        </div>
      </div>
    </>
  )
}
