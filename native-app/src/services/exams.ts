import data from "@/data/exams.json";
import type { Bi } from "@/lib/i18n";

export type DateInfo = { date?: string; endDate?: string; month?: string; status: string; note?: Bi };
export type ExamInfo = {
  id: string;
  slug: string;
  name: Bi;
  shortName: string;
  organization: string;
  category: string;
  posts?: number;
  mode?: Bi;
  dates: Record<string, DateInfo | undefined>;
  officialUrl?: string;
  description?: Bi;
  pattern?: Bi | null;
  syllabus?: unknown;
};
/** Exam calendar synced from the website (examhelp/src/data/exams.ts) by scripts/sync-exams.mjs. */
export const EXAMS = (data as { synced: string; exams: ExamInfo[] }).exams;
export const EXAMS_SYNCED = (data as { synced: string }).synced;
export const examById = (id: string) => EXAMS.find((e) => e.id === id);

export function daysUntil(date: string, now = new Date()): number {
  const t = new Date(`${date}T00:00:00`);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

/** Exams whose exam date is today or later, nearest first. Dates come from the website data. */
export function upcomingExams(now = new Date()): { exam: ExamInfo; date: string; status: string; days: number }[] {
  return EXAMS.flatMap((exam) => {
    const d = exam.dates.exam;
    if (!d?.date) return [];
    const days = daysUntil(d.date, now);
    if (days < 0 || d.status === "COMPLETED") return [];
    return [{ exam, date: d.date, status: d.status, days }];
  }).sort((a, b) => a.days - b.days);
}
