import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import ClassCard from '../components/ClassCard'
import { classes } from '../data/classes'

export default function Classes() {
  return (
    <>
      <SEO title="Classes 5–12" description="Browse study material by class — Classes 5 to 12, CBSE and MP Board, English Medium." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Classes' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Classes 5–12</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          Select a class to explore subjects, notes, solutions, questions, previous papers and premium resources for CBSE and MP Board.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {classes.map((c) => (
            <ClassCard key={c.slug} cls={c} />
          ))}
        </div>
      </div>
    </>
  )
}
