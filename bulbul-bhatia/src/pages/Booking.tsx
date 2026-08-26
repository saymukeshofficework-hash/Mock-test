import { useSearchParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import BookingForm from '../components/BookingForm'
import { useLanguage } from '../i18n/LanguageContext'

export default function Booking() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') ?? undefined

  return (
    <>
      <PageHero eyebrow={t('nav.bookConsultation')} title={t('booking.title')} description={t('booking.subtitle')} />
      <section className="bg-white py-16">
        <div className="container-page mx-auto max-w-3xl">
          <BookingForm defaultType={type} />
          <p className="mt-6 text-center text-xs text-navy-800/50">{t('disclaimer.general')}</p>
        </div>
      </section>
    </>
  )
}
