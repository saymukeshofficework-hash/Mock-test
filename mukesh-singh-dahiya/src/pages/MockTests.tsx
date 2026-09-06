import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import { mockTests } from '../data/mockTests'

export default function MockTests() {
  return (
    <>
      <SEO
        title="English Grammar Mock Tests"
        description="5 timed English Grammar mock tests with a question palette and instant results — fill in the blanks and do-as-directed sentence transformations."
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Mock Tests' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">English Grammar Mock Tests</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          5 timed mock tests covering 119 grammar questions — fill in the blanks and do-as-directed sentence transformations — each with a
          question palette, timer and a detailed results review.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockTests.map((t, i) => (
            <Link key={t.slug} to={`/mock-tests/${t.slug}`} className="card flex flex-col gap-3 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
                <Icon name="clock" className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 dark:text-white">
                Test {i + 1}: {t.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t.topic}</p>
              <p className="text-xs font-semibold text-brand-600 dark:text-cyan-400">
                {t.questions.length} Questions &middot; {t.durationMinutes} Minutes
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
