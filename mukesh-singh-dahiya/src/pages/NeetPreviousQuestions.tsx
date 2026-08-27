import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import EmptyState from '../components/EmptyState'

export default function NeetPreviousQuestions() {
  return (
    <>
      <SEO title="NEET Previous Questions" description="Real NEET previous-year questions — to be added." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET', to: '/neet' }, { label: 'Previous Questions' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">NEET Previous Questions</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Real NEET previous-year questions, organized by year and topic.</p>
        <div className="mt-10">
          <EmptyState title="Previous NEET questions will be added here" message="Real previous-year NEET questions will be uploaded soon." icon="book" />
        </div>
      </div>
    </>
  )
}
