import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import CalculatorForm, { CalculatorField, calculatorInputClass } from '../components/CalculatorForm'
import NotConnectedNotice from '../components/NotConnectedNotice'
import FAQAccordion from '../components/FAQAccordion'
import { useLanguage } from '../i18n/LanguageContext'
import { tools, toolCategories } from '../data/tools'
import { liveCalculators } from '../components/tools/LiveCalculators'
import { useMeta } from '../lib/useMeta'
import NotFound from './NotFound'

const NEEDS_PLACE_ONLY = new Set(['panchang', 'tithi-calculator', 'nakshatra-today', 'choghadiya', 'rahu-kaal', 'abhijit-muhurat', 'sunrise-sunset-calculator', 'auspicious-muhurat-finder'])
const NEEDS_TWO_PEOPLE = new Set(['ashtakoot-guna-milan-calculator', 'kundli-milan', 'marriage-compatibility-calculator', 'love-compatibility-calculator'])

function ArchitectureForm({ toolSlug }: { toolSlug: string }) {
  const { locale, t } = useLanguage()
  const [submitted, setSubmitted] = useState(false)
  const placeOnly = NEEDS_PLACE_ONLY.has(toolSlug)
  const twoPeople = NEEDS_TWO_PEOPLE.has(toolSlug)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <CalculatorForm onSubmit={handleSubmit} submitLabel={t('common.calculate')}>
        {twoPeople ? (
          <>
            <fieldset className="flex flex-col gap-4 sm:col-span-1">
              <legend className="mb-1 text-sm font-semibold text-navy-900">{locale === 'hi' ? 'व्यक्ति 1' : 'Person 1'}</legend>
              <input type="text" placeholder={locale === 'hi' ? 'नाम' : 'Name'} className={calculatorInputClass} />
              <input type="date" aria-label={locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'} className={calculatorInputClass} />
              <input type="time" aria-label={locale === 'hi' ? 'जन्म समय' : 'Time of Birth'} className={calculatorInputClass} />
              <input type="text" placeholder={locale === 'hi' ? 'जन्म स्थान' : 'Place of Birth'} className={calculatorInputClass} />
            </fieldset>
            <fieldset className="flex flex-col gap-4 sm:col-span-1">
              <legend className="mb-1 text-sm font-semibold text-navy-900">{locale === 'hi' ? 'व्यक्ति 2' : 'Person 2'}</legend>
              <input type="text" placeholder={locale === 'hi' ? 'नाम' : 'Name'} className={calculatorInputClass} />
              <input type="date" aria-label={locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'} className={calculatorInputClass} />
              <input type="time" aria-label={locale === 'hi' ? 'जन्म समय' : 'Time of Birth'} className={calculatorInputClass} />
              <input type="text" placeholder={locale === 'hi' ? 'जन्म स्थान' : 'Place of Birth'} className={calculatorInputClass} />
            </fieldset>
          </>
        ) : placeOnly ? (
          <>
            <CalculatorField id="arch-date" label={locale === 'hi' ? 'तिथि' : 'Date'}>
              <input id="arch-date" type="date" className={calculatorInputClass} />
            </CalculatorField>
            <CalculatorField id="arch-place" label={locale === 'hi' ? 'स्थान' : 'Place'}>
              <input id="arch-place" type="text" placeholder={locale === 'hi' ? 'शहर दर्ज करें' : 'Enter city'} className={calculatorInputClass} />
            </CalculatorField>
          </>
        ) : (
          <>
            <CalculatorField id="arch-name" label={locale === 'hi' ? 'नाम' : 'Name'}>
              <input id="arch-name" type="text" className={calculatorInputClass} />
            </CalculatorField>
            <CalculatorField id="arch-dob" label={locale === 'hi' ? 'जन्म तिथि' : 'Date of Birth'}>
              <input id="arch-dob" type="date" className={calculatorInputClass} />
            </CalculatorField>
            <CalculatorField id="arch-tob" label={locale === 'hi' ? 'जन्म समय' : 'Time of Birth'}>
              <input id="arch-tob" type="time" className={calculatorInputClass} />
            </CalculatorField>
            <CalculatorField id="arch-pob" label={locale === 'hi' ? 'जन्म स्थान' : 'Place of Birth'}>
              <input id="arch-pob" type="text" placeholder={locale === 'hi' ? 'शहर दर्ज करें' : 'Enter city'} className={calculatorInputClass} />
            </CalculatorField>
          </>
        )}
      </CalculatorForm>
      {submitted && <NotConnectedNotice />}
    </div>
  )
}

export default function ToolDetail() {
  const { slug } = useParams()
  const { locale, t } = useLanguage()
  const tool = tools.find((tl) => tl.slug === slug)

  useMeta(tool ? tool.metaTitle[locale] : 'Tool not found', tool ? tool.metaDescription[locale] : '')

  if (!tool) return <NotFound />

  const category = toolCategories.find((c) => c.slug === tool.category)
  const Live = liveCalculators[tool.slug]

  const faqItems = [
    {
      question: { en: 'Is this tool free to use?', hi: 'क्या यह टूल निःशुल्क है?' },
      answer: { en: 'Yes, all free tools on this site are free to use, anytime.', hi: 'हां, इस साइट के सभी निःशुल्क टूल्स कभी भी, निःशुल्क उपयोग किए जा सकते हैं।' },
    },
    {
      question: { en: 'How accurate is this result?', hi: 'यह परिणाम कितना सटीक है?' },
      answer: tool.status === 'live'
        ? { en: 'This result is calculated using a standard, deterministic method, but it is general guidance — not a guaranteed prediction.', hi: 'यह परिणाम एक मानक, निश्चित विधि से गणना किया गया है, पर यह सामान्य मार्गदर्शन है — निश्चित भविष्यवाणी नहीं।' }
        : { en: 'This tool requires precise astronomical calculation. The interface is ready — a calculation engine will be connected to produce live results.', hi: 'इस टूल के लिए सटीक खगोलीय गणना आवश्यक है। इंटरफ़ेस तैयार है — वास्तविक परिणामों के लिए एक गणना इंजन जोड़ा जाएगा।' },
    },
  ]

  return (
    <>
      <PageHero eyebrow={category?.name[locale]} title={tool.name[locale]} description={tool.description[locale]} />

      <section className="bg-white py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.5fr,1fr]">
          <div className="flex flex-col gap-12">
            {Live ? <Live /> : <ArchitectureForm toolSlug={tool.slug} />}

            <div>
              <h2 className="mb-4 text-xl font-semibold text-navy-900">{t('nav.faq')}</h2>
              <FAQAccordion categories={[{ category: { en: 'Tool', hi: 'टूल' }, items: faqItems }]} />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="card p-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-royal-600">
                {locale === 'hi' ? 'संबंधित टूल्स' : 'Related Tools'}
              </h3>
              <ul className="flex flex-col gap-2">
                {tools
                  .filter((tl) => tl.category === tool.category && tl.slug !== tool.slug)
                  .slice(0, 6)
                  .map((tl) => (
                    <li key={tl.slug}>
                      <Link to={`/tools/${tl.slug}`} className="text-sm text-navy-800/80 hover:text-rose-600">
                        {tl.name[locale]}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-royal-600">{t('nav.horoscope')}</h3>
              <Link to="/horoscope" className="text-sm text-navy-800/80 hover:text-rose-600">
                {t('sections.horoscopePreviewTitle')} →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
