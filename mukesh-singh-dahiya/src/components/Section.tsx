import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SkyDecor from './SkyDecor'

export default function Section({
  eyebrow,
  title,
  description,
  cta,
  ctaTo,
  children,
  className = '',
  tone = 'light',
}: {
  eyebrow?: string
  title: string
  description?: string
  cta?: string
  ctaTo?: string
  children: ReactNode
  className?: string
  tone?: 'light' | 'dark'
}) {
  const isDark = tone === 'dark'
  return (
    <section className={`${isDark ? 'relative overflow-hidden bg-navy-900' : ''} ${className}`}>
      {isDark && <SkyDecor stars={6} />}
      <div className="container-page reveal relative z-10 py-14 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            {eyebrow && <p className={`section-label mb-2 ${isDark ? 'text-gold-400' : ''}`}>{eyebrow}</p>}
            <h2 className={`text-2xl font-bold sm:text-3xl ${isDark ? 'text-white' : 'text-navy-900 dark:text-white'}`}>{title}</h2>
            {description && <p className={`mt-2 ${isDark ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>{description}</p>}
          </div>
          {cta && ctaTo && (
            <Link to={ctaTo} className={isDark ? 'btn-secondary border-white/20 bg-transparent text-white hover:border-gold-400 hover:text-gold-400' : 'btn-secondary shrink-0'}>
              {cta}
            </Link>
          )}
        </div>
        {children}
      </div>
    </section>
  )
}
