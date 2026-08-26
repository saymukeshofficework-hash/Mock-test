import { Tool } from '../data/types'
import { useLanguage } from '../i18n/LanguageContext'
import { asset } from '../lib/publicBase'

export default function ToolCard({ tool }: { tool: Tool }) {
  const { locale, t } = useLanguage()

  return (
    <a
      href={asset(`/tools/${tool.slug}.html`)}
      className="card flex h-full flex-col gap-3 p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-600"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-navy-900">{tool.name[locale]}</h3>
        {tool.status === 'architecture' && (
          <span className="shrink-0 rounded-full bg-lavender-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-navy-800">
            {t('common.developmentDataLabel').split('—')[0].trim()}
          </span>
        )}
      </div>
      <p className="flex-1 text-sm leading-relaxed text-navy-800/70">{tool.description[locale]}</p>
      <span className="text-sm font-semibold text-royal-600">{t('common.learnMore')} →</span>
    </a>
  )
}
