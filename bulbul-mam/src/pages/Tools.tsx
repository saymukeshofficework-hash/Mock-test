import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import SectionHeading from '../components/SectionHeading'
import ToolCard from '../components/ToolCard'
import CTA from '../components/CTA'
import { useLanguage } from '../i18n/LanguageContext'
import { tools, toolCategories } from '../data/tools'

export default function Tools() {
  const { locale, t } = useLanguage()

  return (
    <>
      <PageHero eyebrow={t('nav.tools')} title={t('sections.toolsTitle')} description={t('sections.toolsSubtitle')} />

      <section className="bg-white py-20">
        <div className="container-page flex flex-col gap-16">
          {toolCategories.map((cat) => (
            <div key={cat.slug} id={cat.slug} className="scroll-mt-24 flex flex-col gap-8">
              <SectionHeading title={cat.name[locale]} align="left" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {tools
                  .filter((tool) => tool.category === cat.slug)
                  .map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
              </div>
            </div>
          ))}

          <div id="horoscope" className="scroll-mt-24 flex flex-col gap-8">
            <SectionHeading title={t('nav.horoscope')} align="left" />
            <Link to="/horoscope" className="card flex w-fit items-center gap-3 p-5 text-sm font-semibold text-navy-900">
              {t('sections.horoscopePreviewTitle')}
              <span aria-hidden="true" className="text-royal-600">→</span>
            </Link>
          </div>
        </div>
      </section>

      <CTA />
    </>
  )
}
