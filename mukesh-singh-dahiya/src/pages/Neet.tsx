import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import Icon from '../components/Icon'

const links = [
  { label: 'Botany', to: '/neet/botany', icon: 'leaf', desc: 'Cell Biology, Plant Physiology, Genetics, Ecology and more.' },
  { label: 'Zoology', to: '/neet/zoology', icon: 'globe', desc: 'Human Physiology, Animal Diversity, Evolution and more.' },
  { label: 'NEET Notes', to: '/neet/notes', icon: 'book', desc: 'Concept notes for Botany and Zoology chapters.' },
  { label: 'NEET Questions', to: '/neet/questions', icon: 'check', desc: 'Chapter-wise and topic-wise MCQ practice.' },
  { label: 'Previous Questions', to: '/neet/previous-questions', icon: 'clock', desc: 'Real NEET previous-year questions — added as available.' },
  { label: 'Revision', to: '/neet/revision', icon: 'flask', desc: 'Quick chapter summaries and key facts.' },
]

export default function Neet() {
  return (
    <>
      <SEO title="NEET Biology" description="Dedicated NEET Biology resources — Botany and Zoology notes, questions, previous questions and revision." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET' }]} />
      <div className="border-b border-slate-200 bg-gradient-to-b from-navy-900 to-navy-950 dark:border-navy-800">
        <div className="container-page py-16 text-center">
          <p className="section-label mb-3 text-cyan-400">NEET Preparation</p>
          <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">NEET Biology</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Dedicated Botany and Zoology resources for NEET aspirants, taught by an M.Sc. Botany graduate with 12 years of teaching experience.
          </p>
        </div>
      </div>
      <div className="container-page py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="card flex flex-col gap-3 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
                <Icon name={l.icon} className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-navy-900 dark:text-white">{l.label}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{l.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
