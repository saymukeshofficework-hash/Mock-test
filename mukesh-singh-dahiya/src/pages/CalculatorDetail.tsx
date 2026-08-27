import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import NotFound from './NotFound'
import { getCalculator } from '../data/calculators'

export default function CalculatorDetail() {
  const { slug = '' } = useParams()
  const found = getCalculator(slug)

  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [result, setResult] = useState<Record<string, number> | string | null>(null)
  const [error, setError] = useState('')

  if (!found) return <NotFound />
  const calc = found

  function handleChange(key: string, value: string) {
    setInputs((v) => ({ ...v, [key]: value }))
  }

  function calculate() {
    setError('')
    const values: Record<string, number> = {}
    for (const field of calc.fields) {
      const raw = inputs[field.key]
      const num = raw === undefined || raw === '' ? NaN : Number(raw)
      if (Number.isNaN(num)) {
        setError(`Please enter a valid number for "${field.label}".`)
        setResult(null)
        return
      }
      values[field.key] = num
    }
    try {
      setResult(calc.compute(values))
    } catch {
      setError('Could not calculate a result with these values. Please check your inputs.')
      setResult(null)
    }
  }

  function reset() {
    setInputs({})
    setResult(null)
    setError('')
  }

  return (
    <>
      <SEO title={calc.title} description={calc.description} />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Calculators', to: '/calculators' }, { label: calc.title }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-xl">
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">{calc.title}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{calc.description}</p>

          <div className="card mt-8 p-6">
            <p className="mb-6 rounded-lg bg-slate-50 px-4 py-3 text-center font-mono text-sm text-navy-800 dark:bg-navy-800 dark:text-slate-100">
              {calc.formula}
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {calc.fields.map((f) => (
                <div key={f.key}>
                  <label htmlFor={f.key} className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    {f.label} {f.unit && <span className="text-slate-400">({f.unit})</span>}
                  </label>
                  <input
                    id={f.key}
                    type="number"
                    inputMode="decimal"
                    className="input"
                    value={inputs[f.key] ?? ''}
                    onChange={(e) => handleChange(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {error && <p className="mt-4 text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button onClick={calculate} className="btn-primary">
                Calculate
              </button>
              <button onClick={reset} className="btn-secondary">
                Reset
              </button>
            </div>

            {result && (
              <div className="mt-6 rounded-xl bg-brand-50 p-5 dark:bg-brand-500/10">
                {typeof result === 'string' ? (
                  <p className="font-semibold text-navy-800 dark:text-slate-100">{result}</p>
                ) : (
                  <dl className="space-y-1">
                    {Object.entries(result).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <dt className="text-sm text-slate-600 dark:text-slate-300">{k}</dt>
                        <dd className="font-bold text-navy-900 dark:text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
