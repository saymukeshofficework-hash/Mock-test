import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import OnlineClassCard from '../components/OnlineClassCard'
import EmptyState from '../components/EmptyState'
import { onlineClasses } from '../data/onlineClasses'

export default function OnlineClasses() {
  return (
    <>
      <SEO title="Online Classes" description="Live online batches for Classes 5–12, CBSE and MP Board." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Online Classes' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Online Classes</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Live, doubt-clearing online batches.</p>
        <div className="mt-10">
          {onlineClasses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {onlineClasses.map((c) => (
                <OnlineClassCard key={c.id} oc={c} />
              ))}
            </div>
          ) : (
            <EmptyState title="No online classes yet" message="Online classes will be announced here soon." />
          )}
        </div>
      </div>
    </>
  )
}
