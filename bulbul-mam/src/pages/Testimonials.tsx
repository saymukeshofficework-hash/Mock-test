import PageHero from '../components/PageHero'
import TestimonialCard from '../components/TestimonialCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { testimonials } from '../data/testimonials'

export default function Testimonials() {
  const { locale, t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.testimonials')} title={t('sections.testimonialsTitle')} />
      <section className="bg-white py-16">
        <div className="container-page flex flex-col gap-8">
          <p className="mx-auto max-w-2xl text-center text-xs text-navy-800/50">
            {locale === 'hi'
              ? 'नीचे दिखाए गए प्रविष्टियां प्लेसहोल्डर हैं। वास्तविक, सहमति-प्राप्त ग्राहक एवं छात्र प्रशंसापत्र उपलब्ध होने पर उन्हें प्रकाशित किया जाएगा।'
              : 'The entries below are placeholders. Real, consented client and student testimonials will be published here once available.'}
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </>
  )
}
