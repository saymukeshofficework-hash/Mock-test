import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import { getAllScienceClasses, countNotesForClass } from '../data/scienceNotes'

export default function ScienceLanding() {
  const classes = getAllScienceClasses()

  return (
    <>
      <SEO
        title="Science Notes — Classes 6 to 12"
        description="Clear, structured and exam-focused Science notes for Classes 6 to 12. Learn concepts, revise important points and prepare with confidence. CBSE & MP Board, English Medium."
      />
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Learn', to: '/learn/science' },
          { label: 'Science Notes' },
        ]}
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/70 py-12 dark:border-navy-800 dark:from-navy-950 dark:via-navy-900/60 dark:to-navy-900 sm:py-16">
        <div className="container-page relative z-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-brand-600 dark:text-cyan-400" />
            <span>CBSE & MP Board · English Medium Curriculum</span>
          </div>

          <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-navy-900 dark:text-white sm:text-4xl lg:text-5xl">
            Science Notes — Classes 6 to 12
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            Clear, structured and exam-focused Science notes for Classes 6 to 12. Learn concepts, revise important points and prepare with confidence.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-emerald-500" />
              <span>Chapter-wise Key Points</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-emerald-500" />
              <span>Crucial Definitions & Formulas</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="check" className="h-4 w-4 text-emerald-500" />
              <span>Board Exam Revision Focus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Class Cards Grid */}
      <section className="container-page py-12 sm:py-16">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div>
            <span className="section-label">Browse by Grade</span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
              Select Your Class
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Organized according to the latest NCERT syllabus for CBSE & MP Board students.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {classes.map((cls) => {
            const totalNotes = countNotesForClass(cls.classSlug)
            const isSenior = cls.classSlug === 'class-11' || cls.classSlug === 'class-12'

            return (
              <div
                key={cls.classSlug}
                className="card group flex flex-col justify-between p-6 transition-all duration-300 hover:shadow-glow"
              >
                <div>
                  {/* Top Row: Numeral & Icon */}
                  <div className="flex items-start justify-between">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-navy-900 text-xl font-bold text-cyan-400 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white dark:bg-cyan-400 dark:text-navy-950 dark:group-hover:bg-cyan-300">
                      {cls.numeral}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 dark:bg-navy-800 dark:text-slate-300 dark:group-hover:bg-navy-700 dark:group-hover:text-cyan-400">
                      <Icon name={cls.icon} className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Title & Subject */}
                  <div className="mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                      {isSenior ? 'Physics · Chemistry · Biology' : 'Science'}
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-bold text-navy-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-cyan-300">
                      Class {cls.numeral} Science
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-400">
                    {cls.description}
                  </p>

                  {/* Badges / Subject Tags */}
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {cls.boards.map((board) => (
                      <span
                        key={board}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-navy-800 dark:text-slate-300"
                      >
                        {board}
                      </span>
                    ))}
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                      {totalNotes} {totalNotes === 1 ? 'Chapter' : 'Chapters'}
                    </span>
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-navy-800">
                  <Link
                    to={`/learn/science/${cls.classSlug}`}
                    className="btn-primary w-full group-hover:shadow-glow"
                  >
                    <span>View Notes</span>
                    <Icon
                      name="arrowRight"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Highlights & Study Method Section */}
      <section className="border-t border-slate-200 bg-slate-50/60 py-14 dark:border-navy-800 dark:bg-navy-900/30">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="section-label">Pedagogy</span>
            <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">
              How Mukesh Sir Prepares You for Science Exams
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Designed by a seasoned educator with 12+ years of teaching excellence to make complex concepts intuitive and memorable.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-cyan-950 dark:text-cyan-400">
                <Icon name="book" className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-bold text-navy-900 dark:text-white">Chapter-Wise Coverage</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Every chapter mapped strictly according to the NCERT/CBSE & MP Board syllabus from basic concepts to advanced applications.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300">
                <Icon name="atom" className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-bold text-navy-900 dark:text-white">Precision Formulas & Terms</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Curated formula sheets, chemical reactions, SI units, and crisp definitions required for objective and descriptive exam answers.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                <Icon name="sparkles" className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-bold text-navy-900 dark:text-white">Exam Tips & High-Yield Points</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Pinpointed common errors, frequently asked board questions, and quick revision markers to maximize your exam score.
              </p>
            </div>

            <div className="card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300">
                <Icon name="dna" className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-serif text-lg font-bold text-navy-900 dark:text-white">Class 11 & 12 Specialized Streams</h3>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                Dedicated subject separation for Physics, Chemistry, and Biology with high relevance to Board Exams and NEET medical entrance.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
