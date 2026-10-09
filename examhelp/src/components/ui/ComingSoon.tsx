import Link from "next/link";
import { Bell, Compass, Sparkles } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { site } from "@/lib/site";
import type { Lang } from "@/types";

/**
 * Intentional "coming soon" state. Used anywhere content is not published
 * yet, so the site never looks empty or broken.
 */
export function ComingSoon({
  lang,
  message,
  title,
  compact = false,
  notifySubject,
}: {
  lang: Lang;
  message: string;
  title?: string;
  compact?: boolean;
  /** Pre-fills the contact form subject when no Telegram/WhatsApp is configured. */
  notifySubject?: string;
}) {
  const notifyHref =
    site.contact.telegram ||
    site.contact.whatsapp ||
    `/contact?subject=${encodeURIComponent(notifySubject ?? "Notify me")}`;
  const external = notifyHref.startsWith("http");

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-accent-50 ${
        compact ? "p-5" : "p-8 sm:p-10"
      }`}
    >
      <div className="relative flex flex-col items-start gap-3">
        <span className="chip bg-accent-100 text-accent-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {tr(dict.comingSoon.badge, lang)}
        </span>
        {title && <h3 className={`font-bold text-brand-900 ${compact ? "text-lg" : "text-2xl"}`}>{title}</h3>}
        <p className="max-w-xl text-ink-700">{message}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {external ? (
            <a href={notifyHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Bell className="h-4 w-4" aria-hidden="true" />
              {tr(dict.comingSoon.notifyMe, lang)}
            </a>
          ) : (
            <Link href={notifyHref} className="btn-primary">
              <Bell className="h-4 w-4" aria-hidden="true" />
              {tr(dict.comingSoon.notifyMe, lang)}
            </Link>
          )}
          <Link href="/exams" className="btn-outline">
            <Compass className="h-4 w-4" aria-hidden="true" />
            {tr(dict.comingSoon.exploreExams, lang)}
          </Link>
        </div>
      </div>
      <svg
        className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-brand-100"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </svg>
    </div>
  );
}
