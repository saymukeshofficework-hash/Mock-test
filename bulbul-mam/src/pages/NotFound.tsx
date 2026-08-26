import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotFound() {
  const { locale, t } = useLanguage()

  return (
    <section className="bg-cosmic-gradient py-32">
      <div className="container-page flex flex-col items-center gap-6 text-center text-white">
        <span className="text-6xl" aria-hidden="true">🌙</span>
        <h1 className="text-3xl font-semibold">{locale === 'hi' ? 'पृष्ठ नहीं मिला' : 'Page Not Found'}</h1>
        <p className="max-w-md text-white/80">
          {locale === 'hi'
            ? 'जिस पृष्ठ को आप खोज रहे हैं वह मौजूद नहीं है या स्थानांतरित हो गया है।'
            : 'The page you are looking for does not exist or has moved.'}
        </p>
        <Link to="/" className="btn-primary">
          {t('common.home')}
        </Link>
      </div>
    </section>
  )
}
