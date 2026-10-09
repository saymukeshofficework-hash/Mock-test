import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ClipboardCheck, FileClock, FileText, Info, Newspaper, NotebookPen, ShieldAlert } from "lucide-react";
import { Countdown } from "@/components/exam/Countdown";
import { ExamCard } from "@/components/exam/ExamCard";
import { NotificationItem } from "@/components/exam/NotificationItem";
import { NotesCard } from "@/components/notes/NotesCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ExternalButton, JsonLd } from "@/components/ui/Primitives";
import { DateStatusBadge, PhaseBadge } from "@/components/ui/StatusBadge";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { examPhase, formatDate, formatExamDate } from "@/lib/dates";
import { getCategory, getExamBySlug, getExams, getNotesForExam, getNotificationsForExam, getRelatedExams } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";
import type { Bilingual, ExamDate } from "@/types";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getExams()).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) return {};
  const dateText = formatExamDate(exam.dates.exam, "en");
  return pageMeta({
    title: `${exam.name.en} — Dates, Status & Official Links`,
    description: `${exam.name.en} by ${exam.organization}${dateText ? `: exam ${dateText}` : ""}. Application dates, date status, official notification and preparation resources.`,
    path: `/exams/${exam.slug}`,
  });
}

export default async function ExamDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const exam = await getExamBySlug(slug);
  if (!exam) notFound();

  const lang = await getLang();
  const now = new Date();
  const phase = examPhase(exam, now);
  const e = dict.exam;
  const [category, related, notes, notices] = await Promise.all([
    getCategory(exam.category),
    getRelatedExams(exam),
    getNotesForExam(exam.slug),
    getNotificationsForExam(exam.slug),
  ]);

  const dateRows: { label: Bilingual; d?: ExamDate }[] = [
    { label: e.applicationStart, d: exam.dates.applicationStart },
    { label: e.applicationEnd, d: exam.dates.applicationEnd },
    { label: e.correctionEnd, d: exam.dates.correctionEnd },
    { label: e.examDate, d: exam.dates.exam },
    { label: e.admitCard, d: exam.dates.admitCard },
    { label: e.answerKey, d: exam.dates.answerKey },
    { label: e.result, d: exam.dates.result },
  ];

  const detailSections: { key: keyof NonNullable<typeof exam.details>; label: Bilingual }[] = [
    { key: "eligibility", label: e.eligibility },
    { key: "ageLimit", label: e.ageLimit },
    { key: "fee", label: e.fee },
    { key: "selectionProcess", label: e.selection },
    { key: "pattern", label: e.pattern },
    { key: "syllabus", label: e.syllabus },
  ];

  const examDate = exam.dates.exam;
  // A passed tentative date must not flip to "completed" — that would claim something unverified.
  const showCountdown =
    !!examDate?.date && phase !== "AWAITING_UPDATE" && ["CONFIRMED", "TENTATIVE", "COMPLETED"].includes(examDate.status);
  const name = tr(exam.name, lang);

  const eventSchema =
    examDate?.date && (examDate.status === "CONFIRMED" || examDate.status === "TENTATIVE")
      ? {
          "@context": "https://schema.org",
          "@type": "EducationEvent",
          name: exam.name.en,
          startDate: examDate.date,
          ...(examDate.endDate ? { endDate: examDate.endDate } : {}),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: "Examination centres, Madhya Pradesh", address: { "@type": "PostalAddress", addressRegion: "MP", addressCountry: "IN" } },
          organizer: { "@type": "Organization", name: exam.organization, url: exam.officialUrl },
          url: `${site.url}/exams/${exam.slug}`,
          description: `${exam.name.en}. Date status: ${examDate.status}. Verify on the official website.`,
        }
      : null;

  return (
    <>
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-canvas">
        <div className="container-page py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { label: tr(dict.nav.home, lang), href: "/" },
              { label: tr(dict.nav.exams, lang), href: "/exams" },
              { label: exam.shortName, href: `/exams/${exam.slug}` },
            ]}
          />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="chip bg-brand-700 text-white">{exam.organization}</span>
            {category && (
              <Link href={`/exams?category=${category.slug}`} className="chip bg-surface text-ink-700 ring-1 ring-ink-200 hover:text-brand-700">
                {tr(category.name, lang)}
              </Link>
            )}
            <PhaseBadge phase={phase} lang={lang} />
          </div>
          <h1 className="mt-3 max-w-4xl text-2xl font-extrabold text-brand-900 sm:text-3xl lg:text-4xl">{name}</h1>
          {exam.description && <p className="mt-3 max-w-3xl text-ink-700">{tr(exam.description, lang)}</p>}
          <p className="mt-3 text-sm text-ink-500">
            {tr(e.source, lang)}:{" "}
            <a href={exam.source.url} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">
              {exam.source.label}
            </a>{" "}
            | {tr(e.updated, lang)}: {formatDate(exam.updatedAt, lang)}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {exam.applyUrl && phase === "APPLICATION_OPEN" && (
              <ExternalButton href={exam.applyUrl} variant="primary" srHint={tr(dict.common.opensNewTab, lang)}>
                {tr(e.apply, lang)}
              </ExternalButton>
            )}
            {exam.rulebookUrl && (
              <ExternalButton href={exam.rulebookUrl} variant="navy" srHint={tr(dict.common.opensNewTab, lang)}>
                {tr(e.rulebook, lang)}
              </ExternalButton>
            )}
            {exam.notificationUrl && exam.notificationUrl !== exam.rulebookUrl && (
              <ExternalButton href={exam.notificationUrl} srHint={tr(dict.common.opensNewTab, lang)}>
                {tr(e.notification, lang)}
              </ExternalButton>
            )}
            <ExternalButton href={exam.officialUrl} srHint={tr(dict.common.opensNewTab, lang)}>
              {tr(e.official, lang)}
            </ExternalButton>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0 space-y-8">
          {/* Our test series for this exam */}
          {exam.testSeries && (
            <a
              href={exam.testSeries.href}
              className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-ink-200 bg-surface p-5 transition hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <span className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-700 text-white">
                  <NotebookPen className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-bold text-ink-900">{tr(exam.testSeries.title, lang)}</span>
                  <span className="mt-0.5 block text-sm text-ink-500">{tr(exam.testSeries.sub, lang)}</span>
                </span>
              </span>
              <span className="btn-primary shrink-0">{tr(exam.testSeries.cta, lang)}</span>
            </a>
          )}

          {/* Overview */}
          <section aria-labelledby="ov-h" className="card p-5 sm:p-6">
            <h2 id="ov-h" className="text-xl font-bold text-brand-900">
              {tr(e.overview, lang)}
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Fact label={tr(e.body, lang)} value={exam.organization === "MPESB" ? "MPESB — मध्यप्रदेश कर्मचारी चयन मंडल" : exam.organization === "MPPSC" ? "MPPSC — मध्यप्रदेश लोक सेवा आयोग" : exam.organization === "MPHC" ? "मध्यप्रदेश उच्च न्यायालय, जबलपुर" : exam.organization} />
              <Fact label={tr(e.type, lang)} value={tr(dict.examType[exam.examType], lang)} />
              <Fact label={tr(e.mode, lang)} value={exam.mode ? tr(exam.mode, lang) : tr(e.notAnnounced, lang)} />
              <Fact label={tr(e.posts, lang)} value={exam.posts ? exam.posts.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN") : tr(e.notAnnounced, lang)} />
            </dl>
          </section>

          {/* Important dates */}
          <section aria-labelledby="dates-h" className="card overflow-hidden">
            <h2 id="dates-h" className="px-5 pt-5 text-xl font-bold text-brand-900 sm:px-6">
              {tr(e.importantDates, lang)}
            </h2>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">{tr(e.importantDates, lang)}</caption>
              <tbody>
                {dateRows.map(({ label, d }) => (
                  <tr key={label.en} className="border-t border-ink-100 align-top">
                    <th scope="row" className="w-2/5 px-5 py-3 text-left font-medium text-ink-500 sm:px-6">
                      {tr(label, lang)}
                    </th>
                    <td className="px-5 py-3 sm:px-6">
                      {d ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-ink-900">{formatExamDate(d, lang) ?? tr(e.notAnnounced, lang)}</span>
                            <DateStatusBadge status={d.status} lang={lang} />
                          </div>
                          {d.note && <p className="text-xs text-ink-500">{tr(d.note, lang)}</p>}
                        </div>
                      ) : (
                        <span className="text-ink-500">{tr(e.notAnnounced, lang)}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Eligibility, fee, pattern... placeholders until sourced */}
          <section aria-labelledby="details-h" className="space-y-3">
            <h2 id="details-h" className="sr-only">
              {tr(e.eligibility, lang)}
            </h2>
            {detailSections.map(({ key, label }) => {
              const val = exam.details?.[key];
              return (
                <details key={key} className="group card" open={key === "eligibility"}>
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                    {tr(label, lang)}
                    <span className="text-ink-500 transition-transform group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-ink-700">
                    {val ? (
                      tr(val, lang)
                    ) : (
                      <p className="flex items-start gap-2 text-sm text-ink-500">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>
                          {tr(e.officialInfoPending, lang)}{" "}
                          {exam.rulebookUrl && (
                            <a href={exam.rulebookUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline underline-offset-2">
                              {tr(e.seeRulebook, lang)}
                            </a>
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </details>
              );
            })}
          </section>


          {/* Preparation resources */}
          <section aria-labelledby="res-h">
            <h2 id="res-h" className="mb-4 text-xl font-bold text-brand-900">
              {tr(e.resources, lang)}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { href: "/notes", label: dict.nav.notes, Icon: BookOpen },
                { href: "/test-series", label: dict.nav.testSeries, Icon: NotebookPen },
                { href: "/practice", label: dict.nav.practice, Icon: ClipboardCheck },
                { href: "/previous-papers", label: dict.nav.previousPapers, Icon: FileClock },
                { href: "/current-affairs", label: dict.nav.currentAffairs, Icon: Newspaper },
                { href: "/notifications", label: dict.nav.notifications, Icon: FileText },
              ].map(({ href, label, Icon }) => (
                <Link key={href} href={href} className="card card-hover flex items-center gap-3 p-4 text-sm font-semibold text-ink-900">
                  <Icon className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                  {tr(label, lang)}
                </Link>
              ))}
            </div>
          </section>

          {notes.length > 0 && (
            <section aria-labelledby="rn-h">
              <h2 id="rn-h" className="mb-4 text-xl font-bold text-brand-900">
                {tr(e.relatedNotes, lang)}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {notes.map((n) => (
                  <NotesCard key={n.id} note={n} lang={lang} />
                ))}
              </div>
            </section>
          )}

          {notices.length > 0 && (
            <section aria-labelledby="rnot-h">
              <h2 id="rnot-h" className="mb-4 text-xl font-bold text-brand-900">
                {tr(e.relatedNotifications, lang)}
              </h2>
              <ul className="card">
                {notices.map((n) => (
                  <NotificationItem key={n.id} n={n} lang={lang} />
                ))}
              </ul>
            </section>
          )}

          <p className="flex items-start gap-2 rounded-xl border border-warning-700/20 bg-warning-50 p-4 text-sm text-warning-700">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              {tr(dict.disclaimer.info, lang)} {tr(dict.disclaimer.affiliation, lang)}
            </span>
          </p>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start">
          {showCountdown && examDate?.date && (
            <div className="card p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-ink-900">{formatExamDate(examDate, lang)}</span>
                <DateStatusBadge status={examDate.status} lang={lang} />
              </div>
              <Countdown
                target={`${examDate.date}T00:00:00+05:30`}
                lang={lang}
                labels={countdownLabels}
                links={{ answerKey: exam.dates.answerKey ? "#dates-h" : undefined, previousPaper: "/previous-papers" }}
              />
              {examDate.status === "TENTATIVE" && (
                <p className="mt-3 text-xs text-warning-700">
                  {lang === "hi" ? "यह संभावित तिथि है — आधिकारिक पुष्टि देखें।" : "This is a tentative date — check for official confirmation."}
                </p>
              )}
            </div>
          )}

          {related.length > 0 && (
            <div>
              <h2 className="mb-3 text-lg font-bold text-brand-900">{tr(e.related, lang)}</h2>
              <div className="space-y-4">
                {related.slice(0, 3).map((r) => (
                  <ExamCard key={r.id} exam={r} lang={lang} now={now} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      {eventSchema && <JsonLd data={eventSchema} />}
    </>
  );
}

const countdownLabels = {
  title: dict.exam.countdownTitle,
  days: dict.exam.days,
  hours: dict.exam.hours,
  minutes: dict.exam.minutes,
  seconds: dict.exam.seconds,
  completed: dict.exam.completedTitle,
  answerKey: dict.exam.answerKey,
  result: dict.exam.result,
  previousPaper: dict.exam.previousPaper,
  analysis: dict.exam.analysis,
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink-900">{value}</dd>
    </div>
  );
}
