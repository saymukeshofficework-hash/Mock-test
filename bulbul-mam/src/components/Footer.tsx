import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { contactConfig } from '../data/contact'

export default function Footer() {
  const { t } = useLanguage()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-950 text-white/80">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-col gap-3 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-serif text-xl font-semibold text-white">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cosmic-gradient text-champagne-300"
            >
              ✦
            </span>
            Bulbul Mam
          </Link>
          <p className="text-sm text-white/60">{t('footer.tagline')}</p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.explore')}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/" className="hover:text-white">{t('nav.home')}</Link></li>
            <li><Link to="/about" className="hover:text-white">{t('nav.about')}</Link></li>
            <li><Link to="/astrology" className="hover:text-white">{t('nav.astrology')}</Link></li>
            <li><Link to="/tarot" className="hover:text-white">{t('nav.tarot')}</Link></li>
            <li><Link to="/courses" className="hover:text-white">{t('nav.courses')}</Link></li>
            <li><Link to="/tools" className="hover:text-white">{t('nav.tools')}</Link></li>
            <li><Link to="/horoscope" className="hover:text-white">{t('nav.horoscope')}</Link></li>
            <li><Link to="/contact" className="hover:text-white">{t('nav.contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.services')}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/astrology-services#janam-kundli-reading" className="hover:text-white">{t('findReading.kundli.title')}</Link></li>
            <li><Link to="/astrology-services#marriage-prediction" className="hover:text-white">{t('booking.types.marriage')}</Link></li>
            <li><Link to="/astrology-services#career-astrology" className="hover:text-white">{t('booking.types.career')}</Link></li>
            <li><Link to="/astrology-services#love-relationship-astrology" className="hover:text-white">{t('booking.types.love')}</Link></li>
            <li><Link to="/tarot-services" className="hover:text-white">{t('nav.tarot')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.courses')}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/tarot-courses" className="hover:text-white">{t('footer.tarotCourses')}</Link></li>
            <li><Link to="/astrology-courses" className="hover:text-white">{t('footer.astrologyCourses')}</Link></li>
            <li><Link to="/courses#beginner" className="hover:text-white">{t('footer.beginner')}</Link></li>
            <li><Link to="/courses#advanced" className="hover:text-white">{t('footer.advanced')}</Link></li>
            <li><Link to="/courses#professional" className="hover:text-white">{t('footer.professional')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.contact')}</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>{contactConfig.phone}</li>
            <li className="break-all">{contactConfig.email}</li>
            <li>
              <a href={contactConfig.instagram} target="_blank" rel="noreferrer" className="hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href={contactConfig.youtube} target="_blank" rel="noreferrer" className="hover:text-white">
                YouTube
              </a>
            </li>
            <li>
              <a href={contactConfig.facebook} target="_blank" rel="noreferrer" className="hover:text-white">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <div className="container-page flex flex-col items-center gap-3 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>
            © {year} Bulbul Mam. {t('footer.rights')}
          </p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-white">{t('footer.terms')}</Link>
            <Link to="/disclaimer" className="hover:text-white">{t('footer.disclaimer')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
