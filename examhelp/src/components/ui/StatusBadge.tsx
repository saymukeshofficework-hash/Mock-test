import { CalendarCheck2, CalendarClock, CalendarX2, CalendarSearch, CircleCheckBig, CircleHelp, PauseCircle } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import type { DateStatus, ExamPhase, Lang } from "@/types";

/**
 * Date-status badge. Official, tentative, expected and TBA are visually
 * distinct (colour + icon + label) so a tentative date is never mistaken
 * for an official one.
 */
const dateStyles: Record<DateStatus, { cls: string; Icon: typeof CalendarCheck2 }> = {
  CONFIRMED: { cls: "bg-success-50 text-success-700 ring-1 ring-success-700/20", Icon: CalendarCheck2 },
  TENTATIVE: { cls: "bg-warning-50 text-warning-700 ring-1 ring-warning-700/25", Icon: CalendarClock },
  EXPECTED: { cls: "bg-brand-50 text-brand-600 ring-1 ring-brand-600/20 border-dashed", Icon: CalendarSearch },
  TBA: { cls: "bg-ink-100 text-ink-700 ring-1 ring-ink-300", Icon: CircleHelp },
  CANCELLED: { cls: "bg-danger-50 text-danger-700 ring-1 ring-danger-700/20 line-through", Icon: CalendarX2 },
  POSTPONED: { cls: "bg-danger-50 text-danger-700 ring-1 ring-danger-700/20", Icon: PauseCircle },
  COMPLETED: { cls: "bg-ink-100 text-ink-700 ring-1 ring-ink-300", Icon: CircleCheckBig },
};

export function DateStatusBadge({ status, lang }: { status: DateStatus; lang: Lang }) {
  const { cls, Icon } = dateStyles[status];
  return (
    <span className={`chip ${cls}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {tr(dict.dateStatus[status], lang)}
    </span>
  );
}

const phaseStyles: Record<ExamPhase, string> = {
  APPLICATION_OPEN: "bg-success-700 text-white",
  APPLICATION_UPCOMING: "bg-brand-600 text-white",
  APPLICATION_CLOSED: "bg-ink-700 text-white",
  EXAM_UPCOMING: "bg-brand-700 text-white",
  EXAM_COMPLETED: "bg-ink-500 text-white",
  AWAITING_UPDATE: "bg-warning-700 text-white",
  NOT_NOTIFIED: "bg-ink-300 text-ink-900",
};

export function PhaseBadge({ phase, lang }: { phase: ExamPhase; lang: Lang }) {
  return (
    <span className={`chip ${phaseStyles[phase]}`}>
      {phase === "APPLICATION_OPEN" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />}
      {tr(dict.phase[phase], lang)}
    </span>
  );
}

/** Legend explaining the badges; shown on the calendar and exam pages. */
export function DateStatusLegend({ lang }: { lang: Lang }) {
  const list: DateStatus[] = ["CONFIRMED", "TENTATIVE", "EXPECTED", "TBA"];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
      {list.map((s) => (
        <DateStatusBadge key={s} status={s} lang={lang} />
      ))}
    </div>
  );
}
