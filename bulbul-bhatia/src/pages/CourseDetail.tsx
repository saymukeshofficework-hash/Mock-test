import { Link, useParams } from 'react-router-dom'
import PageHero from '../components/PageHero'
import FAQAccordion from '../components/FAQAccordion'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'
import { allCourses } from '../data/courses'
import { faqs } from '../data/faqs'
import NotFound from './NotFound'

export default function CourseDetail() {
  const { slug } = useParams()
  const { locale, t } = useLanguage()
  const course = allCourses.find((c) => c.slug === slug)

  if (!course) return <NotFound />

  const courseFaqs = faqs.filter((cat) => cat.category.en === 'Courses')
  const image =
    course.category === 'tarot'
      ? '/images/tarot/crystal-ball-candlelit-tarot-table.webp'
      : '/images/astrology/vedic-zodiac-wheel-mandala.webp'

  return (
    <>
      <PageHero eyebrow={`${course.category === 'tarot' ? t('nav.tarot') : t('nav.astrology')} · ${course.level}`} title={course.title[locale]} description={course.overview[locale]} />

      <section className="bg-white py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[1.6fr,1fr]">
          <div className="flex flex-col gap-10">
            <div className="overflow-hidden rounded-2xl">
              <img src={asset(image)} alt="" aria-hidden="true" className="h-64 w-full object-cover sm:h-80" loading="lazy" />
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">
                {locale === 'hi' ? 'अवलोकन' : 'Overview'}
              </h2>
              <p className="text-sm leading-relaxed text-navy-800/70">{course.overview[locale]}</p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">
                {locale === 'hi' ? 'आप क्या सीखेंगे' : "What You'll Learn"}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {course.whatYouLearn.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-navy-800/80">
                    <span className="mt-0.5 text-rose-500" aria-hidden="true">✦</span>
                    {item[locale]}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">
                {locale === 'hi' ? 'मॉड्यूल' : 'Modules'}
              </h2>
              <ol className="flex flex-col gap-3">
                {course.modules.map((module, idx) => (
                  <li key={idx} className="flex items-center gap-4 rounded-xl border border-navy-900/10 px-4 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush-100 text-xs font-semibold text-rose-600">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-navy-800/80">{module[locale]}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">
                {locale === 'hi' ? 'यह किसके लिए है' : "Who It's For"}
              </h2>
              <p className="text-sm leading-relaxed text-navy-800/70">{course.whoItsFor[locale]}</p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">
                {locale === 'hi' ? 'ऑनलाइन शिक्षा' : 'Online Learning'}
              </h2>
              <p className="text-sm leading-relaxed text-navy-800/70">
                {locale === 'hi'
                  ? 'यह कोर्स पूरी तरह ऑनलाइन सीखने के लिए डिज़ाइन किया गया है, जिससे आप कहीं से भी अपनी गति से सीख सकते हैं।'
                  : 'This course is designed to be learned entirely online, so you can study at your own pace from anywhere.'}
              </p>
            </div>

            <div>
              <h2 className="mb-3 text-xl font-semibold text-navy-900">{t('nav.faq')}</h2>
              <FAQAccordion categories={courseFaqs} />
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="card sticky top-24 flex flex-col gap-4 p-6">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-semibold text-navy-900">{t('common.level')}</dt>
                  <dd className="text-navy-800/70">{course.level}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy-900">{t('common.category')}</dt>
                  <dd className="text-navy-800/70">{course.category === 'tarot' ? t('nav.tarot') : t('nav.astrology')}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy-900">{t('common.duration')}</dt>
                  <dd className="text-navy-800/70">{course.duration ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy-900">{t('common.price')}</dt>
                  <dd className="text-navy-800/70">{course.price ?? '—'}</dd>
                </div>
              </dl>
              <Link to="/book" className="btn-primary w-full">
                {t('common.enrollNow')}
              </Link>
              <p className="text-xs text-navy-800/50">
                {locale === 'hi'
                  ? 'दाखिला बुकिंग फॉर्म के माध्यम से अनुरोध किया जाता है और बुलबुल भाटिया की टीम द्वारा पुष्टि की जाती है।'
                  : 'Enrollment is requested via the booking form and confirmed by Bulbul Bhatia’s team.'}
              </p>
            </div>

            <div className="card flex flex-col gap-2 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-royal-600">
                {locale === 'hi' ? 'प्रशिक्षक' : 'Instructor'}
              </h3>
              <p className="font-serif text-lg font-semibold text-navy-900">Bulbul Bhatia</p>
              <p className="text-sm text-navy-800/70">
                {locale === 'hi' ? 'टैरो रीडर, ज्योतिषी एवं शिक्षिका' : 'Tarot Reader, Astrologer & Teacher'}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <CTA />
    </>
  )
}
