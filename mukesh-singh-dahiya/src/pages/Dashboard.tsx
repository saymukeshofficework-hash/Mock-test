import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import EmptyState from '../components/EmptyState'

const sections = ['Enrolled Courses', 'Purchased Notes', 'Upcoming Online Classes', 'Recently Viewed', 'Progress']

export default function Dashboard() {
  return (
    <>
      <SEO title="Student Dashboard" description="Future student dashboard — accounts and purchases are not yet enabled." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Dashboard' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Student Dashboard</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          Student accounts are not yet enabled. This is a preview of the future dashboard layout.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <div key={s} className="card p-6">
              <h2 className="mb-3 font-bold text-navy-900 dark:text-white">{s}</h2>
              <EmptyState title="Coming soon" message="Available once student accounts are enabled." icon="graduation" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
