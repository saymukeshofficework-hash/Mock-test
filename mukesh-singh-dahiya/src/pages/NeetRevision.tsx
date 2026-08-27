import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { botanyCategories, zoologyCategories } from '../data/neet'

export default function NeetRevision() {
  return (
    <>
      <SEO title="NEET Revision" description="Quick chapter summaries and key facts for NEET Botany and Zoology." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'NEET', to: '/neet' }, { label: 'Revision' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">NEET Revision</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Quick revision categories — chapter summaries and key facts will be added under each.</p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Botany</h2>
            <ul className="space-y-2">
              {botanyCategories.map((c) => (
                <li key={c} className="card px-4 py-3 text-sm text-navy-700 dark:text-slate-200">
                  {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-lg font-bold text-navy-900 dark:text-white">Zoology</h2>
            <ul className="space-y-2">
              {zoologyCategories.map((c) => (
                <li key={c} className="card px-4 py-3 text-sm text-navy-700 dark:text-slate-200">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
