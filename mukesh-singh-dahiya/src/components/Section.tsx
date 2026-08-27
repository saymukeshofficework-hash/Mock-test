import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export default function Section({
  eyebrow,
  title,
  description,
  cta,
  ctaTo,
  children,
  className = '',
}: {
  eyebrow?: string
  title: string
  description?: string
  cta?: string
  ctaTo?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`container-page py-14 sm:py-16 ${className}`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && <p className="section-label mb-2">{eyebrow}</p>}
          <h2 className="text-2xl font-bold text-navy-900 dark:text-white sm:text-3xl">{title}</h2>
          {description && <p className="mt-2 text-slate-600 dark:text-slate-300">{description}</p>}
        </div>
        {cta && ctaTo && (
          <Link to={ctaTo} className="btn-secondary shrink-0">
            {cta}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
