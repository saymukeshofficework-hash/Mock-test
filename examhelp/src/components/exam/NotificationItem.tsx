import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { formatDate } from "@/lib/dates";
import type { ExamNotification, Lang, NotificationType } from "@/types";

const typeStyle: Record<NotificationType, string> = {
  NEW_RECRUITMENT: "bg-brand-700 text-white",
  APPLICATION_OPEN: "bg-success-50 text-success-700 ring-1 ring-success-700/20",
  LAST_DATE: "bg-danger-50 text-danger-700 ring-1 ring-danger-700/20",
  DATE_CHANGE: "bg-warning-50 text-warning-700 ring-1 ring-warning-700/25",
  ADMIT_CARD: "bg-brand-50 text-brand-700 ring-1 ring-brand-600/20",
  ANSWER_KEY: "bg-accent-50 text-accent-700 ring-1 ring-accent-600/25",
  RESULT: "bg-success-700 text-white",
  COUNSELLING: "bg-ink-100 text-ink-700",
  IMPORTANT_NOTICE: "bg-danger-700 text-white",
};

export function NotificationTypeBadge({ type, lang }: { type: NotificationType; lang: Lang }) {
  return <span className={`chip ${typeStyle[type]}`}>{tr(dict.notificationType[type], lang)}</span>;
}

export function NotificationItem({ n, lang, filterType }: { n: ExamNotification; lang: Lang; filterType?: string }) {
  return (
    <li
      {...(filterType ? { "data-f-item": "", "data-f-type": filterType } : {})}
      className="flex flex-col gap-2 border-b border-ink-100 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex shrink-0 items-center gap-2 sm:w-44">
        <NotificationTypeBadge type={n.type} lang={lang} />
        <span className="chip bg-ink-100 text-ink-700">{n.organization}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">
          {n.examSlug ? (
            <Link href={`/exams/${n.examSlug}`} className="hover:text-brand-700">
              {tr(n.title, lang)}
            </Link>
          ) : (
            tr(n.title, lang)
          )}
        </p>
        <p className="text-xs text-ink-500">
          {n.publishedOn ? formatDate(n.publishedOn, lang) : `${tr(dict.exam.updated, lang)}: ${formatDate(n.source.checkedOn, lang)}`}
          {" · "}
          {tr(dict.exam.source, lang)}: {n.source.label}
        </p>
      </div>
      <a
        href={n.officialUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800"
      >
        {tr(dict.exam.official, lang)} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="sr-only">{tr(dict.common.opensNewTab, lang)}</span>
      </a>
    </li>
  );
}
