import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import CourseCard from '../components/CourseCard'
import EmptyState from '../components/EmptyState'
import { courses } from '../data/courses'

export default function Courses() {
  const schoolCourses = courses.filter((c) => c.category === 'school')
  const neetCourses = courses.filter((c) => c.category === 'neet')

  return (
    <>
      <SEO title="Courses" description="Premium school and NEET courses by Mukesh Dahiya." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Courses' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Premium Courses</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Structured, paid courses covering school academics and NEET preparation.</p>

        <section className="mt-10">
          <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">School Courses</h2>
          {schoolCourses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {schoolCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <EmptyState title="No school courses yet" message="School courses will be added here soon." />
          )}
        </section>

        <section className="mt-14">
          <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">NEET Courses</h2>
          {neetCourses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {neetCourses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          ) : (
            <EmptyState title="No NEET courses yet" message="NEET courses will be added here soon." />
          )}
        </section>
      </div>
    </>
  )
}
