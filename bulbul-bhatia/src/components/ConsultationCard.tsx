import { Link } from 'react-router-dom'
import { Consultation } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'

export default function ConsultationCard({ consultation }: { consultation: Consultation }) {
  const { locale, t } = useLanguage()

  return (
    <div className="card flex h-full flex-col gap-4 p-6 text-center">
      <span
        className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blush-100 text-3xl"
        aria-hidden="true"
      >
        {consultation.icon}
      </span>
      <h3 className="text-lg font-semibold text-navy-900">{consultation.name[locale]}</h3>
      <p className="flex-1 text-sm leading-relaxed text-navy-800/70">{consultation.description[locale]}</p>
      <p className="font-serif text-2xl font-semibold text-rose-600">{consultation.price[locale]}</p>
      <Link to={`/book?type=${consultation.bookingType}`} className="btn-primary w-full">
        {t('common.bookReading')}
      </Link>
    </div>
  )
}
