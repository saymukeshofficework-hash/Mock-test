import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Locale, translations } from './translations'

const STORAGE_KEY = 'bulbulmam_locale'

type Dict = Record<string, unknown>

function getPath(obj: Dict, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Dict)) {
      return (acc as Dict)[key]
    }
    return undefined
  }, obj)
}

interface LanguageContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (path: string) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'hi' || saved === 'en' ? saved : 'en'
  })

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = (next: Locale) => setLocaleState(next)

  const t = useMemo(() => {
    return (path: string) => {
      const value = getPath(translations[locale] as Dict, path)
      if (typeof value === 'string') return value
      const fallback = getPath(translations.en as Dict, path)
      if (typeof fallback === 'string') return fallback
      return path
    }
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
