import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function CTA() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-cosmic-gradient py-20">
      <div className="star-field pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="container-page relative flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-3xl font-semibold text-white sm:text-4xl">{t('sections.finalCtaTitle')}</h2>
        <p className="max-w-xl text-white/80">{t('sections.finalCtaDesc')}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/book" className="btn-primary">
            {t('hero.ctaPrimary')}
          </Link>
          <Link to="/courses" className="btn-ghost-light">
            {t('common.exploreCourses')}
          </Link>
          <Link to="/tools" className="btn-ghost-light">
            {t('common.exploreTools')}
          </Link>
        </div>
      </div>
    </section>
  )
}
