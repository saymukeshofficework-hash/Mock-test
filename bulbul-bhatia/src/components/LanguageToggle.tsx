import { useLanguage } from '../i18n/LanguageContext'

interface Props {
  variant?: 'light' | 'dark'
}

export default function LanguageToggle({ variant = 'dark' }: Props) {
  const { locale, setLocale } = useLanguage()
  const base = variant === 'light' ? 'text-white/80' : 'text-navy-900/70'
  const active = variant === 'light' ? 'text-white' : 'text-rose-600'

  return (
    <div className={`flex items-center gap-1 text-sm font-semibold ${base}`} role="group" aria-label="Language selector">
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        className={`rounded-full px-2 py-1 transition hover:opacity-80 ${locale === 'en' ? active : ''}`}
      >
        EN
      </button>
      <span aria-hidden="true">|</span>
      <button
        type="button"
        onClick={() => setLocale('hi')}
        aria-pressed={locale === 'hi'}
        className={`rounded-full px-2 py-1 font-devanagari transition hover:opacity-80 ${locale === 'hi' ? active : ''}`}
      >
        हिंदी
      </button>
    </div>
  )
}
