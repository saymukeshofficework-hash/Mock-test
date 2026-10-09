"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, List, RotateCcw } from "lucide-react";
import { DateStatusBadge, PhaseBadge } from "@/components/ui/StatusBadge";
import { dict, tr } from "@/i18n/dictionary";
import { formatExamDate, formatMonth } from "@/lib/dates";
import type { CategorySlug, DateStatus, Exam, ExamCategory, ExamPhase, Lang } from "@/types";

type View = "month" | "list";

interface Props {
  exams: Exam[];
  phases: Record<string, ExamPhase>;
  categories: ExamCategory[];
  lang: Lang;
  /** "YYYY-MM" of today in IST, computed on the server. */
  initialMonth: string;
}

const dotColor: Record<DateStatus, string> = {
  CONFIRMED: "bg-success-700",
  TENTATIVE: "bg-warning-700",
  EXPECTED: "bg-brand-500",
  TBA: "bg-ink-500",
  CANCELLED: "bg-danger-700",
  POSTPONED: "bg-danger-700",
  COMPLETED: "bg-ink-500",
};

const ym = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

/** Month key(s) an exam belongs to. */
function examMonth(e: Exam): string | null {
  const d = e.dates.exam;
  if (d?.date) return d.date.slice(0, 7);
  if (d?.month) return d.month;
  return null;
}

export function ExamCalendar({ exams, phases, categories, lang, initialMonth }: Props) {
  const c = dict.calendar;
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(initialMonth);
  const [cat, setCat] = useState<CategorySlug | "">("");
  const [org, setOrg] = useState<string>("");
  const [status, setStatus] = useState<DateStatus | "">("");

  const years = useMemo(() => {
    const set = new Set<number>([Number(initialMonth.slice(0, 4))]);
    exams.forEach((e) => {
      const m = examMonth(e);
      if (m) set.add(Number(m.slice(0, 4)));
    });
    return [...set].sort();
  }, [exams, initialMonth]);

  const filtered = useMemo(
    () =>
      exams.filter(
        (e) =>
          (!cat || e.category === cat) &&
          (!org || e.organization === org) &&
          (!status || e.dates.exam?.status === status),
      ),
    [exams, cat, org, status],
  );

  const [year, month] = cursor.split("-").map(Number);
  const monthIdx = month - 1;
  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, monthIdx + delta, 1));
    setCursor(ym(d.getUTCFullYear(), d.getUTCMonth()));
  };

  const inMonth = filtered.filter((e) => examMonth(e) === cursor);
  const dated = inMonth.filter((e) => e.dates.exam?.date);
  const monthOnly = inMonth.filter((e) => !e.dates.exam?.date);

  // Map day -> exams (multi-day exams appear on every day in range within the month).
  const byDay = new Map<number, Exam[]>();
  for (const e of filtered) {
    const d = e.dates.exam;
    if (!d?.date) continue;
    const start = new Date(`${d.date}T00:00:00Z`);
    const end = new Date(`${d.endDate ?? d.date}T00:00:00Z`);
    for (let t = start; t <= end; t = new Date(t.getTime() + 86_400_000)) {
      if (t.getUTCFullYear() === year && t.getUTCMonth() === monthIdx) {
        const day = t.getUTCDate();
        byDay.set(day, [...(byDay.get(day) ?? []), e]);
      }
    }
  }

  const firstWeekday = new Date(Date.UTC(year, monthIdx, 1)).getUTCDay(); // 0 = Sunday
  const daysInMonth = new Date(Date.UTC(year, monthIdx + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const weekdays = lang === "hi" ? ["रवि", "सोम", "मंगल", "बुध", "गुरु", "शुक्र", "शनि"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayKey = initialMonth;

  const selectCls = "h-10 rounded-xl border border-ink-200 bg-surface px-3 text-sm font-medium text-ink-900 focus:border-brand-500";
  const reset = () => {
    setCat("");
    setOrg("");
    setStatus("");
  };

  const listGroups = useMemo(() => {
    const groups = new Map<string, Exam[]>();
    for (const e of filtered) {
      const k = examMonth(e) ?? "tba";
      groups.set(k, [...(groups.get(k) ?? []), e]);
    }
    return [...groups.entries()].sort(([a], [b]) => (a === "tba" ? 1 : b === "tba" ? -1 : a.localeCompare(b)));
  }, [filtered]);

  return (
    <div>
      {/* Controls */}
      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:flex-wrap">
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-500">
            {tr(c.category, lang)}
            <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value as CategorySlug | "")}>
              <option value="">{tr(c.all, lang)}</option>
              {categories.map((x) => (
                <option key={x.slug} value={x.slug}>
                  {tr(x.name, lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-500">
            {tr(c.organization, lang)}
            <select className={selectCls} value={org} onChange={(e) => setOrg(e.target.value)}>
              <option value="">{tr(c.all, lang)}</option>
              <option value="MPESB">MPESB</option>
              <option value="MPPSC">MPPSC</option>
              <option value="MPHC">{lang === "hi" ? "MP हाई कोर्ट" : "MP High Court"}</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-500">
            {tr(c.status, lang)}
            <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as DateStatus | "")}>
              <option value="">{tr(c.all, lang)}</option>
              {(["CONFIRMED", "TENTATIVE", "EXPECTED", "TBA", "COMPLETED"] as DateStatus[]).map((s) => (
                <option key={s} value={s}>
                  {tr(dict.dateStatus[s], lang)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-500">
            {tr(c.year, lang)}
            <select className={selectCls} value={year} onChange={(e) => setCursor(`${e.target.value}-${String(month).padStart(2, "0")}`)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          {(cat || org || status) && (
            <button type="button" onClick={reset} className="btn px-3 text-ink-700 hover:bg-ink-100">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {tr(c.reset, lang)}
            </button>
          )}
          <div role="tablist" aria-label="View" className="inline-flex rounded-xl border border-ink-200 bg-canvas p-1">
            {(["month", "list"] as View[]).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold ${
                  view === v ? "bg-brand-700 text-white" : "text-ink-700 hover:bg-ink-100"
                }`}
              >
                {v === "month" ? <CalendarDays className="h-4 w-4" aria-hidden="true" /> : <List className="h-4 w-4" aria-hidden="true" />}
                {tr(v === "month" ? c.month : c.list, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === "month" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <button type="button" onClick={() => shift(-1)} aria-label={tr(c.prev, lang)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-ink-100">
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <h2 className="text-lg font-bold text-brand-900" aria-live="polite">
                {formatMonth(cursor, lang)}
              </h2>
              <button type="button" onClick={() => shift(1)} aria-label={tr(c.next, lang)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-ink-100">
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="grid grid-cols-7 border-b border-ink-100 bg-canvas text-center text-[11px] font-semibold text-ink-500 sm:text-xs">
              {weekdays.map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((day, i) => {
                const list = day ? byDay.get(day) ?? [] : [];
                return (
                  <div key={i} className={`min-h-14 border-r border-b border-ink-100 p-1 sm:min-h-24 sm:p-1.5 ${i % 7 === 6 ? "border-r-0" : ""} ${day ? "" : "bg-canvas/60"}`}>
                    {day && (
                      <>
                        <span className={`text-xs font-semibold ${list.length ? "text-brand-900" : "text-ink-500"}`}>{day}</span>
                        {/* Dots on small screens */}
                        <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                          {list.map((e) => (
                            <span key={e.id} className={`h-2 w-2 rounded-full ${dotColor[e.dates.exam!.status]}`} title={e.shortName} />
                          ))}
                        </div>
                        {/* Labels on larger screens */}
                        <ul className="mt-1 hidden space-y-1 sm:block">
                          {list.map((e) => (
                            <li key={e.id}>
                              <Link
                                href={`/exams/${e.slug}`}
                                className="flex items-center gap-1 truncate rounded-md bg-brand-50 px-1.5 py-0.5 text-[11px] leading-tight font-semibold text-brand-800 hover:bg-brand-100"
                              >
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[e.dates.exam!.status]}`} aria-hidden="true" />
                                <span className="truncate">{e.shortName}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* This month's exams */}
          <div className="space-y-4">
            {dated.length === 0 && monthOnly.length === 0 ? (
              <div className="card p-6 text-center text-ink-500">{tr(c.nothingThisMonth, lang)}</div>
            ) : (
              <>
                {dated.length > 0 && (
                  <ul className="space-y-3">
                    {dated.map((e) => (
                      <CalendarRow key={e.id} exam={e} phase={phases[e.id]} lang={lang} />
                    ))}
                  </ul>
                )}
                {monthOnly.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-ink-500">{tr(c.monthOnly, lang)}</p>
                    <ul className="space-y-3">
                      {monthOnly.map((e) => (
                        <CalendarRow key={e.id} exam={e} phase={phases[e.id]} lang={lang} />
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
            {cursor !== todayKey && (
              <button type="button" onClick={() => setCursor(todayKey)} className="btn-outline w-full">
                {formatMonth(todayKey, lang)}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {listGroups.length === 0 && <div className="card p-6 text-center text-ink-500">{tr(dict.exam.noExams, lang)}</div>}
          {listGroups.map(([k, list]) => (
            <section key={k} aria-label={k}>
              <h2 className="mb-3 text-lg font-bold text-brand-900">{k === "tba" ? tr(dict.exam.notAnnounced, lang) : formatMonth(k, lang)}</h2>
              {/* Table on desktop */}
              <div className="card hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-canvas text-left text-xs text-ink-500">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(dict.nav.exams, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(c.organization, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(dict.exam.applicationStart, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(dict.exam.applicationEnd, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(dict.exam.examDate, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">{tr(c.status, lang)}</th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        <span className="sr-only">Links</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((e) => (
                      <tr key={e.id} className="border-t border-ink-100 align-top">
                        <td className="max-w-xs px-4 py-3">
                          <Link href={`/exams/${e.slug}`} className="font-semibold text-ink-900 hover:text-brand-700">
                            {e.shortName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">{e.organization}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatExamDate(e.dates.applicationStart, lang) ?? "—"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatExamDate(e.dates.applicationEnd, lang) ?? "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-start gap-1">
                            <span className="whitespace-nowrap">{formatExamDate(e.dates.exam, lang) ?? tr(dict.exam.notAnnounced, lang)}</span>
                            {e.dates.exam && <DateStatusBadge status={e.dates.exam.status} lang={lang} />}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <PhaseBadge phase={phases[e.id]} lang={lang} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 text-xs font-semibold">
                            <a href={e.rulebookUrl ?? e.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800">
                              {tr(dict.exam.official, lang)} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </a>
                            <Link href={`/exams/${e.slug}`} className="text-accent-700 hover:text-accent-600">
                              {tr(c.preparation, lang)} →
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Cards on mobile */}
              <ul className="space-y-3 md:hidden">
                {list.map((e) => (
                  <CalendarRow key={e.id} exam={e} phase={phases[e.id]} lang={lang} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarRow({ exam, phase, lang }: { exam: Exam; phase: ExamPhase; lang: Lang }) {
  const d = exam.dates.exam;
  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip bg-brand-50 text-brand-700">{exam.organization}</span>
        <PhaseBadge phase={phase} lang={lang} />
      </div>
      <Link href={`/exams/${exam.slug}`} className="mt-2 block font-bold text-ink-900 hover:text-brand-700">
        {tr(exam.name, lang)}
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-500">{tr(dict.exam.examDate, lang)}:</span>
        <span className="font-semibold">{formatExamDate(d, lang) ?? tr(dict.exam.notAnnounced, lang)}</span>
        {d && <DateStatusBadge status={d.status} lang={lang} />}
      </div>
      {exam.dates.applicationEnd?.date && (
        <p className="mt-1 text-sm">
          <span className="text-ink-500">{tr(dict.exam.applicationEnd, lang)}:</span>{" "}
          <span className="font-semibold">{formatExamDate(exam.dates.applicationEnd, lang)}</span>
        </p>
      )}
      <div className="mt-3 flex gap-4 text-sm font-semibold">
        <a href={exam.rulebookUrl ?? exam.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-600">
          {tr(dict.exam.official, lang)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <Link href={`/exams/${exam.slug}`} className="text-accent-700">
          {tr(dict.calendar.preparation, lang)} →
        </Link>
      </div>
    </li>
  );
}
