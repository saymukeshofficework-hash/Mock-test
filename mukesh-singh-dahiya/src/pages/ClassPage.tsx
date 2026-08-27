import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import SubjectCard from '../components/SubjectCard'
import ResourceCard from '../components/ResourceCard'
import CourseCard from '../components/CourseCard'
import PaidNoteCard from '../components/PaidNoteCard'
import BundleCard from '../components/BundleCard'
import OnlineClassCard from '../components/OnlineClassCard'
import EmptyState from '../components/EmptyState'
import Badge from '../components/Badge'
import NotFound from './NotFound'
import { getClass } from '../data/classes'
import { subjectsForClass } from '../data/subjects'
import { resources } from '../data/resources'
import { courses } from '../data/courses'
import { paidNotes } from '../data/paidNotes'
import { bundles } from '../data/bundles'
import { onlineClasses } from '../data/onlineClasses'

export default function ClassPage() {
  const { classSlug = '' } = useParams()
  const cls = getClass(classSlug)
  if (!cls) return <NotFound />

  const subjects = subjectsForClass(cls.slug)
  const classResources = resources.filter((r) => r.classSlug === cls.slug)
  const classCourses = courses.filter((c) => c.classSlug === cls.slug)
  const classPaidNotes = paidNotes.filter((n) => n.classSlug === cls.slug)
  const classBundles = bundles.filter((b) => b.classSlug === cls.slug)
  const classOnlineClasses = onlineClasses.filter((c) => c.classSlug === cls.slug)

  return (
    <>
      <SEO title={`${cls.label} Study Material`} description={`${cls.label} notes, solutions, questions and previous papers — CBSE & MP Board, English Medium.`} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Classes', to: '/classes' }, { label: cls.label }]} />

      <div className="border-b border-slate-200 bg-slate-50 dark:border-navy-800 dark:bg-navy-900/40">
        <div className="container-page py-12">
          <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">{cls.label}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{cls.description}</p>
          <div className="mt-4 flex gap-2">
            {cls.boards.map((b) => (
              <Badge key={b} tone="brand">
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-14">
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-navy-900 dark:text-white">Subjects</h2>
          {subjects.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((s) => (
                <SubjectCard key={s.slug} subject={s} classSlug={cls.slug} />
              ))}
            </div>
          ) : (
            <EmptyState title="No subjects configured" message="Subjects for this class will be added here soon." />
          )}
        </section>

        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-bold text-navy-900 dark:text-white">Notes, Solutions & Questions</h2>
          {classResources.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classResources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No resources yet" message="Study material will be added here soon." />
          )}
        </section>

        <section className="mb-14">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-navy-900 dark:text-white">Previous Papers</h2>
            <Link to="/previous-papers" className="text-sm font-semibold text-brand-600 dark:text-cyan-400">
              View All →
            </Link>
          </div>
          <EmptyState title="Previous papers will be added here" message="Previous examination papers for this class will be uploaded soon." icon="book" />
        </section>

        {(classCourses.length > 0 || classPaidNotes.length > 0 || classBundles.length > 0 || classOnlineClasses.length > 0) && (
          <section>
            <h2 className="mb-6 text-2xl font-bold text-navy-900 dark:text-white">Premium Learning</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
              {classPaidNotes.map((n) => (
                <PaidNoteCard key={n.id} note={n} />
              ))}
              {classBundles.map((b) => (
                <BundleCard key={b.id} bundle={b} />
              ))}
              {classOnlineClasses.map((c) => (
                <OnlineClassCard key={c.id} oc={c} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
