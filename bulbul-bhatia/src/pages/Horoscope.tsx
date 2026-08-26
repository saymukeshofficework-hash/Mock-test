import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'
import { zodiacSigns, zodiacHoroscopes } from '../data/zodiac'

const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const
type Period = (typeof PERIODS)[number]

const PERIOD_LABEL: Record<Period, { en: string; hi: string }> = {
  daily: { en: 'Daily', hi: 'दैनिक' },
  weekly: { en: 'Weekly', hi: 'साप्ताहिक' },
  monthly: { en: 'Monthly', hi: 'मासिक' },
  yearly: { en: 'Yearly', hi: 'वार्षिक' },
}

export default function Horoscope() {
  const { locale, t } = useLanguage()
  const [activeSign, setActiveSign] = useState('aries')
  const [period, setPeriod] = useState<Period>('daily')

  const sign = zodiacSigns.find((s) => s.slug === activeSign)!
  const h = zodiacHoroscopes[activeSign]

  return (
    <>
      <PageHero eyebrow={t('nav.horoscope')} title={t('sections.horoscopePreviewTitle')} description={t('common.generalGuidanceLabel')} />

      <section className="bg-white py-16">
        <div className="container-page flex flex-col gap-10">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" role="tablist" aria-label="Zodiac signs">
            {zodiacSigns.map((s) => (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={s.slug === activeSign}
                onClick={() => setActiveSign(s.slug)}
                className={`group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-2xl border p-4 text-center shadow-card transition hover:-translate-y-1 hover:shadow-glow-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600 ${
                  s.slug === activeSign ? 'border-rose-500 bg-twilight-gradient' : 'border-navy-900/10 bg-twilight-gradient'
                }`}
              >
                {s.thumb ? (
                  <img
                    src={asset(s.thumb)}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-90"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-6xl text-white/20" aria-hidden="true">
                    {s.symbol}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" aria-hidden="true" />
                <div className="relative flex flex-col items-center gap-1 text-white">
                  <span className="text-2xl" aria-hidden="true">{s.symbol}</span>
                  <span className="font-serif text-base font-semibold">{s.name[locale]}</span>
                  <span className="text-[11px] text-white/70">{s.dateRange}</span>
                </div>
              </button>
            ))}
          </div>

          <div id={sign.slug} className="scroll-mt-24 flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden="true">{sign.symbol}</span>
                <div>
                  <h2 className="text-2xl font-semibold text-navy-900">{sign.name[locale]}</h2>
                  <p className="text-sm text-navy-800/60">{sign.dateRange} · {sign.element[locale]}</p>
                </div>
              </div>
              <div className="flex gap-2" role="tablist" aria-label="Horoscope period">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    aria-selected={period === p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      period === p ? 'bg-rose-500 text-white' : 'bg-blush-50 text-navy-800/70 hover:bg-blush-100'
                    }`}
                  >
                    {PERIOD_LABEL[p][locale]}
                  </button>
                ))}
              </div>
            </div>

            <span className="w-fit rounded-full bg-lavender-200 px-3 py-1 text-xs font-semibold text-navy-800">
              {t('common.generalGuidanceLabel')}
            </span>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="card p-6">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'सामान्य' : 'General'}
                </h3>
                <p className="text-sm leading-relaxed text-navy-800/80">{h.general[locale]}</p>
              </div>
              <div className="card p-6">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'प्रेम' : 'Love'}
                </h3>
                <p className="text-sm leading-relaxed text-navy-800/80">{h.love[locale]}</p>
              </div>
              <div className="card p-6">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'करियर' : 'Career'}
                </h3>
                <p className="text-sm leading-relaxed text-navy-800/80">{h.career[locale]}</p>
              </div>
              <div className="card p-6">
                <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'वित्त' : 'Finance'}
                </h3>
                <p className="text-sm leading-relaxed text-navy-800/80">{h.finance[locale]}</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <div className="card p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'शुभ अंक' : 'Lucky Number'}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-navy-900">{h.luckyNumber}</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'शुभ रंग' : 'Lucky Color'}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-navy-900">{h.luckyColor[locale]}</p>
              </div>
              <div className="card p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-royal-600">
                  {locale === 'hi' ? 'मार्गदर्शन' : 'Guidance'}
                </p>
                <p className="mt-1 text-sm text-navy-800/80">{h.guidance[locale]}</p>
              </div>
            </div>

            <div className="card flex flex-col items-center gap-3 bg-blush-50 p-6 text-center">
              <p className="text-sm font-semibold text-navy-900">{t('common.wantDeeperGuidance')}</p>
              <p className="max-w-md text-xs text-navy-800/60">{t('common.deeperGuidanceNote')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/book" className="btn-primary !px-5 !py-2.5 text-xs">
                  {t('common.bookAstrologyConsultation')}
                </Link>
                <Link to="/tools" className="btn-secondary !px-5 !py-2.5 text-xs">
                  {t('common.exploreTools')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
