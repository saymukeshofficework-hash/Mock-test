import { Link } from 'react-router-dom'
import { Course } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'
import { LEVEL_LABEL } from '../data/courses'

const LEVEL_COLORS: Record<string, string> = {
  basic: 'bg-sky-100 text-sky-700',
  advanced: 'bg-orange-100 text-orange-700',
}

const CATEGORY_LABEL_KEY: Record<Course['category'], string> = {
  tarot: 'nav.tarot',
  astrology: 'nav.astrology',
  handwriting: 'common.handwriting',
}

export default function CourseCard({ course }: { course: Course }) {
  const { locale, t } = useLanguage()
  const image =
    course.category === 'tarot'
      ? '/images/tarot/moon-card-tarot-spread-crystals.webp'
      : course.category === 'astrology'
        ? '/images/astrology/vedic-zodiac-wheel-mandala.webp'
        : null

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden">
        {image ? (
          <img src={asset(image)} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cosmic-gradient text-4xl" aria-hidden="true">
            ✍️
          </div>
        )}
        {course.level && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[course.level]}`}>
            {LEVEL_LABEL[course.level][locale]}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-royal-600">
          {t(CATEGORY_LABEL_KEY[course.category])}
        </span>
        <h3 className="text-lg font-semibold text-navy-900">{course.title[locale]}</h3>
        <p className="flex-1 text-sm leading-relaxed text-navy-800/70">{course.description[locale]}</p>
        <dl className="grid grid-cols-2 gap-2 text-xs text-navy-800/60">
          <div>
            <dt className="font-semibold">{t('common.duration')}</dt>
            <dd>{course.duration[locale]}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t('common.price')}</dt>
            <dd className="text-sm font-semibold text-rose-600">{course.price}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <Link to={`/courses/${course.slug}`} className="text-sm font-semibold text-royal-600 hover:underline">
            {t('common.viewCourse')}
          </Link>
          <Link to="/book" className="text-sm font-semibold text-rose-600 hover:underline">
            {t('common.enrollNow')} →
          </Link>
        </div>
      </div>
    </div>
  )
}
