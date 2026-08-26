import { Link } from 'react-router-dom'
import { ZodiacSign } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'

export default function ZodiacCard({ sign }: { sign: ZodiacSign }) {
  const { locale } = useLanguage()

  return (
    <Link
      to={`/horoscope#${sign.slug}`}
      className="group relative flex aspect-square flex-col items-center justify-end overflow-hidden rounded-2xl border border-navy-900/10 bg-twilight-gradient p-4 text-center shadow-card transition hover:-translate-y-1 hover:shadow-glow-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
    >
      {sign.thumb ? (
        <img
          src={asset(sign.thumb)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-90"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-6xl text-white/20" aria-hidden="true">
          {sign.symbol}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-1 text-white">
        <span className="text-2xl" aria-hidden="true">
          {sign.symbol}
        </span>
        <span className="font-serif text-base font-semibold">{sign.name[locale]}</span>
        <span className="text-[11px] text-white/70">{sign.dateRange}</span>
      </div>
    </Link>
  )
}
