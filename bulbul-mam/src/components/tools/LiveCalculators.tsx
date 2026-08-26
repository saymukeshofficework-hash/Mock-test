import { FormEvent, useState } from 'react'
import CalculatorForm, { CalculatorField, calculatorInputClass } from '../CalculatorForm'
import ResultCard from '../ResultCard'
import { useLanguage } from '../../i18n/LanguageContext'
import {
  parseDateInput,
  lifePathNumber,
  destinyNumber,
  nameNumber,
  luckyNumbers,
  luckyDates,
  personalYearNumber,
} from '../../lib/numerology'
import { meaningFor } from '../../data/numerologyMeanings'
import { sunSignFromDate } from '../../lib/sunSign'
import { zodiacSigns, zodiacHoroscopes } from '../../data/zodiac'

function NumberSections(n: number, locale: 'en' | 'hi', labels: { meaning: string; strengths: string; challenges: string; guidance: string }) {
  const m = meaningFor(n)
  return [
    { label: labels.meaning, text: m.meaning[locale] },
    { label: labels.strengths, text: m.strengths[locale] },
    { label: labels.challenges, text: m.challenges[locale] },
    { label: labels.guidance, text: m.guidance[locale] },
  ]
}

function sectionLabels(locale: 'en' | 'hi') {
  return locale === 'hi'
    ? { meaning: 'इसका अर्थ', strengths: 'ताकतें', challenges: 'चुनौतियां', guidance: 'मार्गदर्शन' }
    : { meaning: 'What This Means', strengths: 'Strengths', challenges: 'Challenges', guidance: 'Guidance' }
}

function DateOnlyForm({ onCompute, label }: { onCompute: (d: string) => void; label: string }) {
  const { t } = useLanguage()
  const [date, setDate] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) {
      setError(t('booking.required'))
      return
    }
    setError('')
    onCompute(date)
  }

  return (
    <CalculatorForm onSubmit={handleSubmit} submitLabel={t('common.calculate')}>
      <CalculatorField id="dob" label={label}>
        <input
          id="dob"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={calculatorInputClass}
          aria-invalid={!!error}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </CalculatorField>
    </CalculatorForm>
  )
}

function NameOnlyForm({ onCompute, label }: { onCompute: (name: string) => void; label: string }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { t } = useLanguage()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError(t('booking.required'))
      return
    }
    setError('')
    onCompute(name.trim())
  }

  return (
    <CalculatorForm onSubmit={handleSubmit} submitLabel={t('common.calculate')}>
      <CalculatorField id="name" label={label}>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={calculatorInputClass}
          aria-invalid={!!error}
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </CalculatorField>
    </CalculatorForm>
  )
}

export function LifePathCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<number | null>(null)
  const label = locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'

  return (
    <div className="flex flex-col gap-8">
      <DateOnlyForm
        label={label}
        onCompute={(date) => {
          const parsed = parseDateInput(date)
          if (parsed) setResult(lifePathNumber(parsed))
        }}
      />
      {result !== null && (
        <ResultCard
          title={locale === 'hi' ? 'आपका जीवन पथ अंक' : 'Your Life Path Number'}
          value={String(result)}
          sections={NumberSections(result, locale, sectionLabels(locale))}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function DestinyNumberCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<number | null>(null)
  const label = locale === 'hi' ? 'पूरा नाम' : 'Full Name'

  return (
    <div className="flex flex-col gap-8">
      <NameOnlyForm label={label} onCompute={(name) => setResult(destinyNumber(name))} />
      {result !== null && (
        <ResultCard
          title={locale === 'hi' ? 'आपका भाग्य अंक' : 'Your Destiny Number'}
          value={String(result)}
          sections={NumberSections(result, locale, sectionLabels(locale))}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function NameNumberCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<number | null>(null)
  const label = locale === 'hi' ? 'नाम' : 'Name'

  return (
    <div className="flex flex-col gap-8">
      <NameOnlyForm label={label} onCompute={(name) => setResult(nameNumber(name))} />
      {result !== null && (
        <ResultCard
          title={locale === 'hi' ? 'नाम अंक' : 'Name Number'}
          value={String(result)}
          sections={NumberSections(result, locale, sectionLabels(locale))}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function LuckyNumberCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<number[] | null>(null)
  const label = locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'

  return (
    <div className="flex flex-col gap-8">
      <DateOnlyForm
        label={label}
        onCompute={(date) => {
          const parsed = parseDateInput(date)
          if (parsed) setResult(luckyNumbers(parsed))
        }}
      />
      {result && (
        <ResultCard
          title={locale === 'hi' ? 'आपके शुभ अंक' : 'Your Lucky Numbers'}
          value={result.join(' • ')}
          sections={[
            {
              label: locale === 'hi' ? 'इसका अर्थ' : 'What This Means',
              text:
                locale === 'hi'
                  ? 'ये अंक आपकी जन्म तिथि से अंकशास्त्रीय रूप से जुड़े हैं और महत्वपूर्ण निर्णयों में सहायक हो सकते हैं।'
                  : 'These numbers are numerologically linked to your birth date and can be a helpful reference for important decisions.',
            },
            {
              label: locale === 'hi' ? 'मार्गदर्शन' : 'Guidance',
              text:
                locale === 'hi'
                  ? 'इन्हें एक सहायक संकेत के रूप में उपयोग करें, निर्णय का एकमात्र आधार नहीं।'
                  : 'Use these as a supportive signal, not the sole basis for a decision.',
            },
          ]}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function LuckyDateCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<{ life: number; dates: number[] } | null>(null)
  const label = locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'

  return (
    <div className="flex flex-col gap-8">
      <DateOnlyForm
        label={label}
        onCompute={(date) => {
          const parsed = parseDateInput(date)
          if (parsed) {
            const life = lifePathNumber(parsed)
            setResult({ life, dates: luckyDates(life) })
          }
        }}
      />
      {result && (
        <ResultCard
          title={locale === 'hi' ? 'शुभ तिथियां (हर माह)' : 'Lucky Dates (each month)'}
          value={result.dates.join(', ')}
          sections={[
            {
              label: locale === 'hi' ? 'इसका अर्थ' : 'What This Means',
              text:
                locale === 'hi'
                  ? `ये तिथियां आपके जीवन पथ अंक ${result.life} के अनुरूप हैं।`
                  : `These dates align with your Life Path number ${result.life}.`,
            },
          ]}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function PersonalYearCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<number | null>(null)
  const label = locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col gap-8">
      <DateOnlyForm
        label={label}
        onCompute={(date) => {
          const parsed = parseDateInput(date)
          if (parsed) setResult(personalYearNumber(parsed, currentYear))
        }}
      />
      {result !== null && (
        <ResultCard
          title={locale === 'hi' ? `आपका व्यक्तिगत वर्ष (${currentYear})` : `Your Personal Year (${currentYear})`}
          value={String(result)}
          sections={NumberSections(result, locale, sectionLabels(locale))}
        />
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function NumerologyOverviewCalculator() {
  const { locale, t } = useLanguage()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [errors, setErrors] = useState<{ name?: string; date?: string }>({})
  const [result, setResult] = useState<{ life: number; destiny: number } | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: { name?: string; date?: string } = {}
    if (!name.trim()) nextErrors.name = t('booking.required')
    if (!date) nextErrors.date = t('booking.required')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const parsed = parseDateInput(date)
    if (!parsed) return
    setResult({ life: lifePathNumber(parsed), destiny: destinyNumber(name.trim()) })
  }

  return (
    <div className="flex flex-col gap-8">
      <CalculatorForm onSubmit={handleSubmit} submitLabel={t('common.calculate')}>
        <CalculatorField id="full-name" label={locale === 'hi' ? 'पूरा नाम' : 'Full Name'}>
          <input id="full-name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={calculatorInputClass} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
        </CalculatorField>
        <CalculatorField id="dob2" label={locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}>
          <input id="dob2" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={calculatorInputClass} aria-invalid={!!errors.date} />
          {errors.date && <p className="text-xs text-rose-600">{errors.date}</p>}
        </CalculatorField>
      </CalculatorForm>
      {result && (
        <div className="grid gap-6 sm:grid-cols-2">
          <ResultCard
            title={locale === 'hi' ? 'जीवन पथ अंक' : 'Life Path Number'}
            value={String(result.life)}
            sections={NumberSections(result.life, locale, sectionLabels(locale)).slice(0, 2)}
          />
          <ResultCard
            title={locale === 'hi' ? 'भाग्य अंक' : 'Destiny Number'}
            value={String(result.destiny)}
            sections={NumberSections(result.destiny, locale, sectionLabels(locale)).slice(0, 2)}
          />
        </div>
      )}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export function SunSignCalculator() {
  const { locale, t } = useLanguage()
  const [result, setResult] = useState<string | null>(null)
  const label = locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'

  return (
    <div className="flex flex-col gap-8">
      <DateOnlyForm
        label={label}
        onCompute={(date) => {
          const parsed = parseDateInput(date)
          if (parsed) setResult(sunSignFromDate(parsed.month, parsed.day))
        }}
      />
      {result &&
        (() => {
          const sign = zodiacSigns.find((s) => s.slug === result)
          const h = zodiacHoroscopes[result]
          if (!sign || !h) return null
          return (
            <ResultCard
              title={locale === 'hi' ? 'आपकी सूर्य राशि' : 'Your Sun Sign'}
              value={`${sign.symbol} ${sign.name[locale]}`}
              sections={[
                { label: locale === 'hi' ? 'इसका अर्थ' : 'What This Means', text: sign.traits[locale] },
                { label: locale === 'hi' ? 'ताकतें' : 'Strengths', text: h.strengths[locale] },
                { label: locale === 'hi' ? 'चुनौतियां' : 'Challenges', text: h.challenges[locale] },
                { label: locale === 'hi' ? 'मार्गदर्शन' : 'Guidance', text: h.guidance[locale] },
              ]}
            />
          )
        })()}
      <p className="text-xs text-navy-800/50">{t('disclaimer.tools')}</p>
    </div>
  )
}

export const liveCalculators: Record<string, () => JSX.Element> = {
  'numerology-calculator': NumerologyOverviewCalculator,
  'life-path-number-calculator': LifePathCalculator,
  'destiny-number-calculator': DestinyNumberCalculator,
  'name-number-calculator': NameNumberCalculator,
  'lucky-number-calculator': LuckyNumberCalculator,
  'lucky-date-calculator': LuckyDateCalculator,
  'personal-year-calculator': PersonalYearCalculator,
  'sun-sign-calculator': SunSignCalculator,
}
