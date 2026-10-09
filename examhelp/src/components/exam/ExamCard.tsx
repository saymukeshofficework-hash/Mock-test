import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, Hourglass, Users } from "lucide-react";
import { DateStatusBadge, PhaseBadge } from "@/components/ui/StatusBadge";
import { dict, tr } from "@/i18n/dictionary";
import { daysUntil, examPhase, formatExamDate } from "@/lib/dates";
import type { Exam, Lang } from "@/types";

/** Upcoming-exam card (spec §9). All values come from the exam record. */
export function ExamCard({ exam, lang, now = new Date() }: { exam: Exam; lang: Lang; now?: Date }) {
  const phase = examPhase(exam, now);
  const e = dict.exam;
  const examDate = exam.dates.exam;
  const lastDate = exam.dates.applicationEnd;
  const examText = formatExamDate(examDate, lang) ?? tr(e.notAnnounced, lang);

  // Days remaining: to the application deadline while open, otherwise to the exam.
  let countdown: { days: number; label: string } | null = null;
  if (phase === "APPLICATION_OPEN" && lastDate?.date) {
    countdown = { days: daysUntil(lastDate.date, now), label: tr(e.applicationEnd, lang) };
  } else if (examDate?.date && (phase === "APPLICATION_CLOSED" || phase === "EXAM_UPCOMING" || phase === "APPLICATION_UPCOMING")) {
    countdown = { days: daysUntil(examDate.date, now), label: tr(e.examDate, lang) };
  }

  return (
    <article className="card card-hover flex h-full flex-col p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip bg-brand-50 text-brand-700">{exam.organization}</span>
        <span className="chip bg-ink-100 text-ink-700">{tr(dict.examType[exam.examType], lang)}</span>
        <PhaseBadge phase={phase} lang={lang} />
      </div>

      <h3 className="mt-3 text-lg leading-snug font-bold text-ink-900">
        <Link href={`/exams/${exam.slug}`} className="hover:text-brand-700">
          {lang === "hi" ? exam.name.hi : exam.name.en}
        </Link>
      </h3>

      <dl className="mt-4 space-y-2.5 text-sm">
        {lastDate?.date && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <dt className="text-ink-500">{tr(e.applicationEnd, lang)}</dt>
            <dd className="flex items-center gap-2 font-semibold text-ink-900">
              {formatExamDate(lastDate, lang)}
            </dd>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="flex items-center gap-1.5 text-ink-500">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {tr(e.examDate, lang)}
          </dt>
          <dd className="flex flex-wrap items-center justify-end gap-2 font-semibold text-ink-900">
            <span>{examText}</span>
            {examDate && <DateStatusBadge status={examDate.status} lang={lang} />}
          </dd>
        </div>
        {exam.posts && (
          <div className="flex items-center justify-between gap-2">
            <dt className="flex items-center gap-1.5 text-ink-500">
              <Users className="h-4 w-4" aria-hidden="true" />
              {tr(e.posts, lang)}
            </dt>
            <dd className="font-semibold text-ink-900">{exam.posts.toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</dd>
          </div>
        )}
      </dl>

      {countdown && countdown.days >= 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-accent-50 px-3 py-2 text-sm font-semibold text-accent-700">
          <Hourglass className="h-4 w-4" aria-hidden="true" />
          {countdown.days === 0 ? tr(e.today, lang) : `${countdown.days} ${tr(e.daysLeft, lang)}`}
          <span className="font-normal text-ink-500">· {countdown.label}</span>
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link href={`/exams/${exam.slug}`} className="btn-navy flex-1">
          {tr(e.viewDetails, lang)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <a
          href={exam.rulebookUrl || exam.notificationUrl || exam.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          aria-label={`${tr(e.notification, lang)} — ${exam.shortName} ${tr(dict.common.opensNewTab, lang)}`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          <span className="sm:hidden xl:inline">{exam.organization}</span>
        </a>
      </div>
    </article>
  );
}

export function ExamGrid({ exams, lang, now }: { exams: Exam[]; lang: Lang; now?: Date }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((e) => (
        <ExamCard key={e.id} exam={e} lang={lang} now={now} />
      ))}
    </div>
  );
}
