import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import SubjectCard from '../components/SubjectCard'
import { subjects } from '../data/subjects'

export default function Subjects() {
  return (
    <>
      <SEO title="Subjects" description="Browse all subjects taught — English, Hindi, Mathematics, Science, Social Science, Physics, Chemistry and Biology." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Subjects' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Subjects</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Select a subject to explore chapters, notes, solutions and questions.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => (
            <SubjectCard key={s.slug} subject={s} />
          ))}
        </div>
      </div>
    </>
  )
}
