import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import { ExamGrid } from "@/components/exam/ExamCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageHeader, SectionHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getUpcomingExams } from "@/lib/repo";
import type { Bilingual, Lang } from "@/types";

/**
 * Landing page for sections whose content arrives in later phases
 * (test series, practice, current affairs, papers, results, admit cards).
 * Shows an intentional coming-soon state plus genuinely useful links, so
 * the page is never empty.
 */
export async function SectionLanding({
  lang,
  title,
  subtitle,
  path,
  message,
  notifySubject,
  categories,
  officialLinks,
  children,
}: {
  lang: Lang;
  title: string;
  subtitle: string;
  path: string;
  message: string;
  notifySubject: string;
  categories?: Bilingual[];
  officialLinks?: { label: string; url: string }[];
  children?: ReactNode;
}) {
  const upcoming = await getUpcomingExams(3);
  return (
    <>
      <PageHeader title={title} subtitle={subtitle}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: title, href: path }]} />
      </PageHeader>
      <div className="container-page space-y-12 py-8">
        <ComingSoon lang={lang} title={title} message={message} notifySubject={notifySubject} />

        {categories && categories.length > 0 && (
          <section aria-label={tr(dict.calendar.category, lang)}>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((c) => (
                <li key={c.en} className="card flex min-h-16 items-center justify-between gap-2 p-4">
                  <span className="font-semibold text-ink-900">{tr(c, lang)}</span>
                  <span className="chip bg-accent-50 text-accent-700">{tr(dict.comingSoon.badge, lang)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {children}

        {officialLinks && officialLinks.length > 0 && (
          <section aria-labelledby="off-h">
            <h2 id="off-h" className="mb-4 text-xl font-bold text-brand-900">
              {tr(dict.sections.sources, lang)}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {officialLinks.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="card card-hover flex items-center justify-between gap-3 p-4 font-semibold text-ink-900">
                    {l.label}
                    <ExternalLink className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {upcoming.length > 0 && (
          <section aria-labelledby="up-h">
            <SectionHeader id="up-h" title={tr(dict.sections.upcoming, lang)} href="/exams" linkLabel={tr(dict.sections.viewAll, lang)} />
            <ExamGrid exams={upcoming} lang={lang} />
          </section>
        )}
      </div>
    </>
  );
}
