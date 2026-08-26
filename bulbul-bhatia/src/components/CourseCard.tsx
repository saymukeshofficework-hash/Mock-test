import { Link } from 'react-router-dom'
import { Course } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Basic: 'bg-sky-100 text-sky-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-orange-100 text-orange-700',
  Professional: 'bg-rose-100 text-rose-700',
  Mastery: 'bg-lavender-200 text-navy-800',
}

export default function CourseCard({ course }: { course: Course }) {
  const { locale, t } = useLanguage()
  const image =
    course.category === 'tarot'
      ? '/images/tarot/moon-card-tarot-spread-crystals.webp'
      : '/images/astrology/vedic-zodiac-wheel-mandala.webp'

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="relative h-40 w-full overflow-hidden">
        <img src={asset(image)} alt="" aria-hidden="true" className="h-full w-full object-cover" loading="lazy" />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[course.level]}`}>
          {course.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-royal-600">
          {course.category === 'tarot' ? t('nav.tarot') : t('nav.astrology')}
        </span>
        <h3 className="text-lg font-semibold text-navy-900">{course.title[locale]}</h3>
        <p className="flex-1 text-sm leading-relaxed text-navy-800/70">{course.description[locale]}</p>
        <dl className="grid grid-cols-3 gap-2 text-xs text-navy-800/60">
          <div>
            <dt className="font-semibold">{t('common.duration')}</dt>
            <dd>{course.duration ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t('common.price')}</dt>
            <dd>{course.price ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-semibold">{t('common.certificate')}</dt>
            <dd>{course.certificate ? '✓' : '—'}</dd>
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
