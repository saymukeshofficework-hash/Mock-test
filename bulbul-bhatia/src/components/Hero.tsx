import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden bg-cosmic-gradient">
      <div className="star-field pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl animate-float"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-royal-500/30 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
        aria-hidden="true"
      />

      <div className="container-page relative grid gap-12 py-20 sm:py-28 lg:grid-cols-2 lg:items-center lg:py-32">
        <div className="flex flex-col items-start gap-6 text-left animate-fade-in">
          <span className="eyebrow text-champagne-300">{t('hero.supporting')}</span>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            {t('hero.headline')}
          </h1>
          <p className="max-w-xl text-lg text-white/80">{t('hero.description')}</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/book" className="btn-primary">
              {t('hero.ctaPrimary')}
            </Link>
            <Link to="/courses" className="btn-ghost-light">
              {t('hero.ctaSecondary')}
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="glass-card relative overflow-hidden p-3 shadow-glow">
            <img
              src={asset('/images/tarot/tarot-cards-in-hand-forest-light.webp')}
              alt="A hand raising a fan of illuminated Tarot cards"
              className="aspect-[3/4] w-full rounded-xl object-cover"
              loading="eager"
              width={768}
              height={1024}
            />
          </div>
          <div
            className="glass-card absolute -bottom-8 -left-8 hidden w-40 items-center gap-2 p-3 text-white sm:flex"
            aria-hidden="true"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-xs font-medium">Moon • Stars • Tarot</span>
          </div>
        </div>
      </div>
    </section>
  )
}
