import { useState } from 'react'
import { FAQCategory } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'

export default function FAQAccordion({ categories }: { categories: FAQCategory[] }) {
  const { locale } = useLanguage()
  const [openKey, setOpenKey] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-10">
      {categories.map((cat) => (
        <div key={cat.category.en}>
          <h3 className="mb-4 text-xl font-semibold text-navy-900">{cat.category[locale]}</h3>
          <div className="flex flex-col gap-3">
            {cat.items.map((item, idx) => {
              const key = `${cat.category.en}-${idx}`
              const isOpen = openKey === key
              return (
                <div key={key} className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
                  <h4>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-navy-900"
                      aria-expanded={isOpen}
                      aria-controls={`${key}-panel`}
                      id={`${key}-trigger`}
                      onClick={() => setOpenKey(isOpen ? null : key)}
                    >
                      {item.question[locale]}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M1 4l6 6 6-6" stroke="currentColor" strokeWidth="1.6" fill="none" />
                      </svg>
                    </button>
                  </h4>
                  {isOpen && (
                    <div id={`${key}-panel`} role="region" aria-labelledby={`${key}-trigger`} className="px-5 pb-4">
                      <p className="text-sm leading-relaxed text-navy-800/70">{item.answer[locale]}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
