"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Bilingual, Lang } from "@/types";

interface Labels {
  title: Bilingual;
  days: Bilingual;
  hours: Bilingual;
  minutes: Bilingual;
  seconds: Bilingual;
  completed: Bilingual;
  answerKey: Bilingual;
  result: Bilingual;
  previousPaper: Bilingual;
  analysis: Bilingual;
}

/**
 * Live Days/Hours/Minutes/Seconds countdown. Flips to "Exam Completed"
 * with follow-up links once `target` passes — no reload needed.
 * Renders a static fallback on the server to avoid hydration mismatch.
 */
export function Countdown({
  target,
  lang,
  labels,
  links,
  compact = false,
}: {
  target: string; // ISO datetime
  lang: Lang;
  labels: Labels;
  links?: { answerKey?: string; result?: string; previousPaper?: string; analysis?: string };
  compact?: boolean;
}) {
  const t = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = now === null ? null : t - now;

  if (diff !== null && diff <= 0) {
    const items = [
      { label: labels.answerKey, href: links?.answerKey },
      { label: labels.result, href: links?.result },
      { label: labels.previousPaper, href: links?.previousPaper },
      { label: labels.analysis, href: links?.analysis },
    ];
    return (
      <div className="rounded-xl border border-ink-200 bg-ink-100/60 p-4">
        <p className="flex items-center gap-2 font-bold text-ink-900">
          <CheckCircle2 className="h-5 w-5 text-success-700" aria-hidden="true" />
          {labels.completed[lang]}
        </p>
        {!compact && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {items.map((i) => (
              <li key={i.label.en}>
                {i.href ? (
                  <Link href={i.href} className="chip bg-surface text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50">
                    {i.label[lang]}
                  </Link>
                ) : (
                  <span className="chip bg-surface text-ink-500 ring-1 ring-ink-200">{i.label[lang]}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const parts =
    diff === null
      ? null
      : {
          d: Math.floor(diff / 86_400_000),
          h: Math.floor((diff / 3_600_000) % 24),
          m: Math.floor((diff / 60_000) % 60),
          s: Math.floor((diff / 1000) % 60),
        };
  const cells = [
    { v: parts?.d, l: labels.days },
    { v: parts?.h, l: labels.hours },
    { v: parts?.m, l: labels.minutes },
    { v: parts?.s, l: labels.seconds },
  ];

  return (
    <div>
      {!compact && <p className="mb-2 text-sm font-semibold text-ink-500">{labels.title[lang]}</p>}
      <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {cells.map((c) => (
          <div key={c.l.en} className={`rounded-xl bg-brand-900 text-center text-white ${compact ? "py-1.5" : "py-3"}`}>
            <span className={`block font-bold tabular-nums ${compact ? "text-lg" : "text-2xl sm:text-3xl"}`}>
              {c.v === undefined ? "--" : String(c.v).padStart(2, "0")}
            </span>
            <span className="block text-[10px] tracking-wide text-brand-100 uppercase sm:text-xs">{c.l[lang]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
