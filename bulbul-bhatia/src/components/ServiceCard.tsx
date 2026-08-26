import { Link } from 'react-router-dom'
import { Service } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'

export default function ServiceCard({ service }: { service: Service }) {
  const { locale, t } = useLanguage()
  const basePath = service.category === 'astrology' ? '/astrology-services' : '/tarot-services'

  return (
    <div className="card flex h-full flex-col gap-4 p-6">
      <span
        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blush-100 text-2xl"
        aria-hidden="true"
      >
        {service.icon}
      </span>
      <h3 className="text-lg font-semibold text-navy-900">{service.name[locale]}</h3>
      <p className="flex-1 text-sm leading-relaxed text-navy-800/70">{service.description[locale]}</p>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <Link to={`${basePath}#${service.slug}`} className="text-sm font-semibold text-royal-600 hover:underline">
          {t('common.learnMore')}
        </Link>
        <Link to="/book" className="text-sm font-semibold text-rose-600 hover:underline">
          {t('common.bookReading')} →
        </Link>
      </div>
    </div>
  )
}
