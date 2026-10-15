import { ExamCalendar } from "@/components/exam/ExamCalendar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/Primitives";
import { DateStatusLegend } from "@/components/ui/StatusBadge";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { examPhase } from "@/lib/dates";
import { getCategories, getExams } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Exam Calendar 2026 — MPESB & MPPSC Exam Schedule",
  description:
    "Madhya Pradesh exam calendar 2026: MPESB and MPPSC exam dates in month and list view, filtered by category, body and status. Official, tentative and expected dates clearly marked.",
  path: "/exam-calendar",
});

export default async function ExamCalendarPage() {
  const lang = await getLang();
  const now = new Date();
  const [exams, categories] = await Promise.all([getExams(now), getCategories()]);
  const phases = Object.fromEntries(exams.map((e) => [e.id, examPhase(e, now)]));
  const istMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit" }).format(now).slice(0, 7);

  return (
    <>
      <PageHeader title={tr(dict.calendar.title, lang)} subtitle={tr(dict.calendar.subtitle, lang)}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: tr(dict.nav.calendar, lang), href: "/exam-calendar" }]} />
      </PageHeader>
      <div className="container-page py-8">
        <div className="mb-5 space-y-2">
          <DateStatusLegend lang={lang} />
          <p className="text-xs text-ink-500">
            {lang === "hi"
              ? "अंतिम समीक्षा: 15 अक्टूबर 2026। उपलब्ध आधिकारिक स्रोतों से तिथियाँ जाँची गई हैं; संभावित/अपेक्षित तिथियाँ अलग चिह्नित हैं।"
              : "Last reviewed: 15 October 2026. Dates were checked against available official sources; tentative/expected dates are labelled separately."}
          </p>
        </div>
        <ExamCalendar exams={exams} phases={phases} categories={categories} lang={lang} initialMonth={istMonth} />
        <p className="mt-8 text-xs text-ink-500">{tr(dict.disclaimer.info, lang)}</p>
      </div>
    </>
  );
}
