import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

interface Section {
  label: string
  text: string
}

interface Props {
  title: string
  value: string
  sections: Section[]
}

export default function ResultCard({ title, value, sections }: Props) {
  const { t } = useLanguage()

  return (
    <div className="card overflow-hidden">
      <div className="bg-cosmic-gradient px-6 py-8 text-center text-white sm:px-10">
        <p className="eyebrow text-champagne-300">{title}</p>
        <p className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">{value}</p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        {sections.map((section) => (
          <div key={section.label}>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-royal-600">{section.label}</h3>
            <p className="text-sm leading-relaxed text-navy-800/80">{section.text}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-navy-900/5 bg-blush-50 px-6 py-6 text-center sm:px-10">
        <p className="mb-1 text-sm font-semibold text-navy-900">{t('common.wantDeeperGuidance')}</p>
        <p className="mb-4 text-xs text-navy-800/60">{t('common.deeperGuidanceNote')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/book" className="btn-primary !px-5 !py-2.5 text-xs">
            {t('common.bookAstrologyConsultation')}
          </Link>
          <Link to="/book" className="btn-secondary !px-5 !py-2.5 text-xs">
            {t('common.bookTarotReading')}
          </Link>
        </div>
      </div>
    </div>
  )
}
