import { Testimonial } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'

export default function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const { locale } = useLanguage()

  return (
    <figure className="card flex h-full flex-col gap-4 p-6">
      <span className="text-3xl text-rose-400" aria-hidden="true">
        "
      </span>
      <blockquote className="flex-1 text-sm leading-relaxed text-navy-800/80">{testimonial.quote[locale]}</blockquote>
      <figcaption className="flex flex-col gap-0.5 border-t border-navy-900/5 pt-3">
        <span className="text-sm font-semibold text-navy-900">{testimonial.name}</span>
        {testimonial.location && <span className="text-xs text-navy-800/50">{testimonial.location[locale]}</span>}
      </figcaption>
    </figure>
  )
}
