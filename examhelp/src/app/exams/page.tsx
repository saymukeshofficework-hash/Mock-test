import Link from "next/link";
import { CategoryCard } from "@/components/exam/CategoryCard";
import { ExamCard } from "@/components/exam/ExamCard";
import { FilterChips } from "@/components/exam/FilterChips";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState, PageHeader, SectionHeader } from "@/components/ui/Primitives";
import { DateStatusLegend } from "@/components/ui/StatusBadge";
import { UrlFilter } from "@/components/ui/UrlFilter";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { examPhase } from "@/lib/dates";
import { getCategories, getExams } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Upcoming Exams 2026 — MPESB, MPPSC Exam Dates & Status",
  description:
    "All upcoming Madhya Pradesh government exams in 2026: MPESB and MPPSC application dates, exam dates, status and official links — Police, TET, Group 2, Group 3, Nayab Tahsildar and more.",
  path: "/exams",
});

const statusGroups = {
  open: ["APPLICATION_OPEN", "APPLICATION_UPCOMING"],
  upcoming: ["APPLICATION_CLOSED", "EXAM_UPCOMING"],
  completed: ["EXAM_COMPLETED", "AWAITING_UPDATE"],
} as const;

/** Which status filter group an exam phase belongs to. */
const groupOf = (phase: string) =>
  (Object.entries(statusGroups).find(([, list]) => (list as readonly string[]).includes(phase))?.[0] ?? "other");

export default async function ExamsPage() {
  const lang = await getLang();
  const now = new Date();
  const [all, categories] = await Promise.all([getExams(now), getCategories()]);

  const c = dict.calendar;
  const statusLabels = {
    open: { hi: "आवेदन जारी / शीघ्र", en: "Applications open / soon" },
    upcoming: { hi: "परीक्षा आगामी", en: "Exam upcoming" },
    completed: { hi: "सम्पन्न", en: "Completed" },
  };

  return (
    <>
      <PageHeader title={tr(dict.exam.allExams, lang)} subtitle={tr(dict.exam.allExamsSub, lang)}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: tr(dict.nav.exams, lang), href: "/exams" }]} />
      </PageHeader>

      <div className="container-page py-8">
        <div className="card space-y-3 p-4 sm:p-5">
          <FilterChips
            label={tr(c.category, lang)}
            param="category"
            allLabel={tr(c.all, lang)}
            options={categories.map((cat) => ({ value: cat.slug, label: tr(cat.name, lang) }))}
          />
          <FilterChips
            label={tr(c.organization, lang)}
            param="org"
            allLabel={tr(c.all, lang)}
            options={[
              { value: "MPESB", label: "MPESB" },
              { value: "MPPSC", label: "MPPSC" },
              { value: "MPHC", label: tr(dict.org.MPHC, lang) },
            ]}
          />
          <FilterChips
            label={tr(c.status, lang)}
            param="status"
            allLabel={tr(c.all, lang)}
            options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: tr(l, lang) }))}
          />
        </div>

        <div className="my-5 flex flex-wrap items-center justify-between gap-3">
          <UrlFilter
            scope="exam-list"
            params={["category", "org", "status"]}
            countLabel
            empty={
              <EmptyState
                title={tr(dict.exam.noExams, lang)}
                hint={tr(dict.exam.noExamsHint, lang)}
                action={
                  <Link href="/exams" className="btn-outline">
                    {tr(c.reset, lang)}
                  </Link>
                }
              />
            }
          />
          <DateStatusLegend lang={lang} />
        </div>

        <div id="exam-list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((e) => (
            <div key={e.id} data-f-item="" data-f-category={e.category} data-f-org={e.organization} data-f-status={groupOf(examPhase(e, now))}>
              <ExamCard exam={e} lang={lang} now={now} />
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink-500">{tr(dict.disclaimer.info, lang)}</p>

        <section id="categories" className="mt-14 scroll-mt-24" aria-labelledby="cats-h">
          <SectionHeader id="cats-h" title={tr(dict.sections.categories, lang)} subtitle={tr(dict.sections.categoriesSub, lang)} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} lang={lang} count={all.filter((e) => e.category === cat.slug).length} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
