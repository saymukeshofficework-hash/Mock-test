import type { Exam, ExamDate, ExamPhase, Lang } from "@/types";

/** All exam dates are Indian dates; anchor them to IST. */
const IST = "+05:30";

export function startOfDayIST(iso: string): Date {
  return new Date(`${iso}T00:00:00${IST}`);
}

export function endOfDayIST(iso: string): Date {
  return new Date(`${iso}T23:59:59${IST}`);
}

const locale = (lang: Lang) => (lang === "hi" ? "hi-IN" : "en-IN");

export function formatDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(startOfDayIST(iso));
}

export function formatShortDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(startOfDayIST(iso));
}

export function formatMonth(ym: string, lang: Lang): string {
  return new Intl.DateTimeFormat(locale(lang), {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(startOfDayIST(`${ym}-01`));
}

/** Human text for an ExamDate, e.g. "19 नवंबर 2026" / "नवंबर 2026" / null. */
export function formatExamDate(d: ExamDate | undefined, lang: Lang): string | null {
  if (!d) return null;
  if (d.date && d.endDate) return `${formatShortDate(d.date, lang)} – ${formatDate(d.endDate, lang)}`;
  if (d.date) return formatDate(d.date, lang);
  if (d.month) return formatMonth(d.month, lang);
  return null;
}

/** First instant of the exam, for countdowns and sorting. */
export function examStart(exam: Exam): Date | null {
  const d = exam.dates.exam;
  if (d?.date) return startOfDayIST(d.date);
  if (d?.month) return startOfDayIST(`${d.month}-01`);
  return null;
}

export function examEnd(exam: Exam): Date | null {
  const d = exam.dates.exam;
  if (d?.endDate) return endOfDayIST(d.endDate);
  if (d?.date) return endOfDayIST(d.date);
  return null;
}

/** Whole days from `now` until `iso` (IST). Negative when past. */
export function daysUntil(iso: string, now = new Date()): number {
  const ms = startOfDayIST(iso).getTime() - now.getTime();
  return Math.ceil(ms / 86_400_000);
}

/**
 * Where an exam currently stands. Pure function of data + now so it can be
 * reused on the server, in the calendar and by the client countdown.
 */
export function examPhase(exam: Exam, now = new Date()): ExamPhase {
  const ex = exam.dates.exam;
  if (ex?.status === "COMPLETED") return "EXAM_COMPLETED";

  const end = examEnd(exam);
  if (end && now > end) {
    return ex?.status === "CONFIRMED" ? "EXAM_COMPLETED" : "AWAITING_UPDATE";
  }

  const aStart = exam.dates.applicationStart?.date;
  const aEnd = exam.dates.applicationEnd?.date;
  if (aStart && aEnd) {
    if (now < startOfDayIST(aStart)) return "APPLICATION_UPCOMING";
    if (now <= endOfDayIST(aEnd)) return "APPLICATION_OPEN";
    return "APPLICATION_CLOSED";
  }

  if (ex?.date) return "EXAM_UPCOMING";
  if (ex?.month) {
    // Expected month already over and nothing newer on record.
    const monthEnd = new Date(startOfDayIST(`${ex.month}-01`));
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return now >= monthEnd ? "AWAITING_UPDATE" : "EXAM_UPCOMING";
  }
  return "NOT_NOTIFIED";
}

/**
 * Sort key: exams with an actual date first (soonest first), then month-only
 * "expected" exams, then undated, then awaiting update, then completed.
 */
export function compareExams(a: Exam, b: Exam, now = new Date()): number {
  const rank = (e: Exam) => {
    const p = examPhase(e, now);
    if (p === "EXAM_COMPLETED") return 4;
    if (p === "AWAITING_UPDATE") return 3;
    if (e.dates.exam?.date) return 0;
    return e.dates.exam?.month ? 1 : 2;
  };
  const r = rank(a) - rank(b);
  if (r !== 0) return r;
  const ta = examStart(a)?.getTime() ?? Infinity;
  const tb = examStart(b)?.getTime() ?? Infinity;
  return ta - tb;
}
