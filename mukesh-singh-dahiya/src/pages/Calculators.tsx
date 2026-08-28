import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import CalculatorCard from '../components/CalculatorCard'
import Icon from '../components/Icon'
import { calculators, calculatorCategories } from '../data/calculators'

export default function Calculators() {
  return (
    <>
      <SEO title="Educational Calculators" description="Mathematics, Physics, Chemistry and Biology calculators for quick, formula-based problem solving." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Calculators' }]} />
      <div className="container-page py-14 sm:py-16">
        <h1 className="font-serif text-3xl font-bold text-navy-900 dark:text-white sm:text-4xl">Educational Calculators</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">Formula-based calculators for Mathematics, Physics, Chemistry and Biology / NEET.</p>

        <Link to="/calculators/converter" className="card mt-8 flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-cyan-300">
            <Icon name="calc" className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-navy-900 dark:text-white">Unit Converter</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Length, mass, time, area, volume and speed conversions.</p>
          </div>
        </Link>

        {calculatorCategories.map((cat) => {
          const items = calculators.filter((c) => c.category === cat)
          if (!items.length) return null
          return (
            <section key={cat} className="mt-12">
              <h2 className="mb-5 text-xl font-bold text-navy-900 dark:text-white">{cat}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <CalculatorCard key={c.slug} calc={c} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}
