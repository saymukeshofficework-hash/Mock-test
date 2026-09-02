import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'
import NotFound from './NotFound'
import { getScienceClass, getScienceNotesForClass } from '../data/scienceNotes'

export default function ScienceClassPage() {
  const { classSlug = '' } = useParams<{ classSlug: string }>()
  const cls = getScienceClass(classSlug)

  // Subject filter for Class 11 and 12
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch all notes for this class
  const allNotes = useMemo(() => (cls ? getScienceNotesForClass(cls.classSlug) : []), [cls])

  // Filter notes based on subject and search query
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      const matchesSubject = selectedSubject === 'all' || note.subjectSlug === selectedSubject
      const q = searchQuery.trim().toLowerCase()
      if (!q) return matchesSubject

      const matchesQuery =
        note.chapterName.toLowerCase().includes(q) ||
        note.shortDescription.toLowerCase().includes(q) ||
        note.topics.some((t) => t.title.toLowerCase().includes(q)) ||
        note.keywords.some((k) => k.toLowerCase().includes(q))

      return matchesSubject && matchesQuery
    })
  }, [allNotes, selectedSubject, searchQuery])

  if (!cls) {
    return <NotFound />
  }

  const isSenior = cls.classSlug === 'class-11' || cls.classSlug === 'class-12'

  return (
    <>
      <SEO
        title={`Class ${cls.numeral} Science Notes — CBSE & MP Board`}
        description={`Chapter-wise Class ${cls.numeral} Science revision notes, formulas, definitions and key questions for CBSE & MP Board English Medium.`}
      />
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Science Notes', to: '/learn/science' },
          { label: `Class ${cls.numeral}` },
        ]}
      />

      {/* Hero Header */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 py-10 dark:border-navy-800 dark:from-navy-950 dark:via-navy-900/50 dark:to-navy-900 sm:py-14">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-navy-900 px-2.5 py-1 text-xs font-bold text-cyan-400 dark:bg-cyan-400 dark:text-navy-950">
                  Class {cls.numeral}
                </span>
                {cls.boards.map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-navy-700 dark:bg-navy-800 dark:text-slate-300"
                  >
                    {b}
                  </span>
                ))}
                <span className="rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:bg-cyan-950/60 dark:text-cyan-300">
                  {allNotes.length} Chapters Mapped
                </span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-extrabold text-navy-900 dark:text-white sm:text-4xl">
                Science Notes — Class {cls.numeral}
              </h1>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
                {cls.description}
              </p>
            </div>

            {/* Quick Class Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white p-2 shadow-card dark:border-navy-800 dark:bg-navy-900 md:self-auto">
              <span className="px-2 text-xs font-semibold text-slate-400">Class:</span>
              {['6', '7', '8', '9', '10', '11', '12'].map((num) => {
                const targetSlug = `class-${num}`
                const isActive = targetSlug === cls.classSlug
                return (
                  <Link
                    key={num}
                    to={`/learn/science/${targetSlug}`}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm dark:bg-cyan-400 dark:text-navy-950'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-800'
                    }`}
                  >
                    {num}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Subject Filter Tabs (Especially for Class 11 & 12) */}
          {isSenior && (
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-6 dark:border-navy-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
                Filter Subject:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubject('all')}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                  selectedSubject === 'all'
                    ? 'bg-navy-900 text-white shadow-sm dark:bg-cyan-400 dark:text-navy-950'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300 dark:hover:bg-navy-700'
                }`}
              >
                All Subjects ({allNotes.length})
              </button>
              {cls.subjects.map((sub) => {
                const count = allNotes.filter((n) => n.subjectSlug === sub.slug).length
                const active = selectedSubject === sub.slug
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => setSelectedSubject(sub.slug)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                      active
                        ? 'bg-brand-600 text-white shadow-sm dark:bg-cyan-400 dark:text-navy-950'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300 dark:hover:bg-navy-700'
                    }`}
                  >
                    <Icon name={sub.icon} className="h-3.5 w-3.5" />
                    <span>{sub.name}</span>
                    <span className="text-[11px] opacity-75">({count})</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="container-page py-10 sm:py-14">
        {/* Search & Stats Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-navy-900 dark:text-white sm:text-2xl">
              Chapter-Wise Notes & Solutions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {filteredNotes.length} of {allNotes.length} chapters
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters or topics..."
              className="input pl-9 text-sm"
              aria-label="Filter chapters"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chapters Listing */}
        {filteredNotes.length === 0 ? (
          <div className="card flex flex-col items-center justify-center p-12 text-center">
            <Icon name="search" className="h-10 w-10 text-slate-300 dark:text-navy-600" />
            <h3 className="mt-4 font-serif text-lg font-bold text-navy-900 dark:text-white">
              No matching chapters found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Try adjusting your search keywords or clearing the subject filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedSubject('all')
              }}
              className="btn-secondary mt-5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note) => {
              const isAvailable = note.status === 'available'

              return (
                <div
                  key={note.id}
                  className="card group flex flex-col justify-between p-5 transition-all duration-300 hover:border-brand-400/80 hover:shadow-glow dark:hover:border-cyan-400/40"
                >
                  <div>
                    {/* Top Row: Chapter Badge & Subject */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex h-7 items-center rounded-md bg-navy-900 px-2 text-xs font-bold text-cyan-400 dark:bg-cyan-400/10 dark:text-cyan-300">
                        Chapter {note.chapterNumber}
                      </span>
                      {isSenior ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-navy-800 dark:text-slate-300">
                          {note.subjectName}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Icon name="book" className="h-3.5 w-3.5" />
                          <span>NCERT</span>
                        </span>
                      )}
                    </div>

                    {/* Chapter Name */}
                    <h3 className="mt-3 font-serif text-lg font-bold text-navy-900 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-cyan-300">
                      {note.chapterName}
                    </h3>

                    {/* Short Description */}
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2 dark:text-slate-400">
                      {note.shortDescription}
                    </p>

                    {/* Key Topics Pills */}
                    {note.topics.length > 0 && (
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {note.topics.slice(0, 3).map((topic) => (
                          <span
                            key={topic.id}
                            className="rounded bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-navy-800/80 dark:text-slate-400"
                          >
                            {topic.title}
                          </span>
                        ))}
                        {note.topics.length > 3 && (
                          <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-400 dark:bg-navy-800/80">
                            +{note.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
                    {isAvailable ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Full Notes Ready
                        </span>
                        <Link
                          to={`/learn/science/${cls.classSlug}/${note.slug}`}
                          className="btn-primary !px-3.5 !py-1.5 !text-xs"
                        >
                          <span>Read Notes</span>
                          <Icon name="arrowRight" className="h-3.5 w-3.5" />
                        </Link>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          Updating by Mukesh Sir
                        </span>
                        <Link
                          to={`/learn/science/${cls.classSlug}/${note.slug}`}
                          className="btn-secondary !px-3.5 !py-1.5 !text-xs hover:border-brand-300"
                        >
                          <span>View Overview</span>
                          <Icon name="arrowRight" className="h-3.5 w-3.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}
