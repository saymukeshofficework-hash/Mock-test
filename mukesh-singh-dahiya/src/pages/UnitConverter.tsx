import { useState } from 'react'
import SEO from '../components/SEO'
import Breadcrumbs from '../components/Breadcrumbs'
import { unitCategories } from '../data/unitConverter'

export default function UnitConverter() {
  const [categoryKey, setCategoryKey] = useState(unitCategories[0].key)
  const category = unitCategories.find((c) => c.key === categoryKey)!
  const [fromUnit, setFromUnit] = useState(category.units[0].key)
  const [toUnit, setToUnit] = useState(category.units[1]?.key ?? category.units[0].key)
  const [value, setValue] = useState('1')

  function changeCategory(key: string) {
    const cat = unitCategories.find((c) => c.key === key)!
    setCategoryKey(key)
    setFromUnit(cat.units[0].key)
    setToUnit(cat.units[1]?.key ?? cat.units[0].key)
  }

  const from = category.units.find((u) => u.key === fromUnit)!
  const to = category.units.find((u) => u.key === toUnit)!
  const num = Number(value)
  const converted = Number.isNaN(num) ? null : (num * from.toBase) / to.toBase

  return (
    <>
      <SEO title="Unit Converter" description="Convert between length, mass, time, area, volume and speed units." />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Calculators', to: '/calculators' }, { label: 'Unit Converter' }]} />
      <div className="container-page py-14 sm:py-16">
        <div className="mx-auto max-w-xl">
          <h1 className="font-serif text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">Unit Converter</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Quick conversions across common measurement categories.</p>

          <div className="card mt-8 p-6">
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Category</label>
            <select className="input mb-5" value={categoryKey} onChange={(e) => changeCategory(e.target.value)}>
              {unitCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">Value</label>
                <input type="number" className="input" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">From</label>
                <select className="input" value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
                  {category.units.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">To</label>
                <select className="input" value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
                  {category.units.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-brand-50 p-5 text-center dark:bg-brand-500/10">
              <p className="text-2xl font-bold text-navy-900 dark:text-white">
                {converted !== null ? `${value} ${from.label} = ${Math.round(converted * 1e6) / 1e6} ${to.label}` : 'Enter a valid number'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
