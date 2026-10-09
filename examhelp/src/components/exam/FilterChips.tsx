"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, type ComponentProps } from "react";

export interface ChipOption {
  value: string;
  label: string;
}

/**
 * Filter chips driven by URL search params (?category=…). Each filtered view
 * has a shareable URL. Filtering itself happens in <UrlFilter>, client-side,
 * so pages stay fully static (works on any host, including GitHub Pages).
 */
function FilterChipsInner({
  label,
  param,
  options,
  allLabel,
}: {
  label: string;
  param: string;
  options: ChipOption[];
  allLabel: string;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get(param) ?? undefined;

  const hrefFor = (value?: string) => {
    const q = new URLSearchParams(sp.toString());
    q.delete(param);
    if (value) q.set(param, value);
    const s = q.toString();
    return s ? `${pathname}?${s}` : pathname;
  };
  const chip = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full px-3.5 text-sm font-semibold transition-colors ${
      active ? "bg-brand-700 text-white" : "bg-surface text-ink-700 ring-1 ring-ink-200 hover:ring-brand-500"
    }`;
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="w-24 shrink-0 text-sm font-semibold text-ink-500">{label}</span>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href={hrefFor(undefined)} className={chip(!current)} aria-current={!current ? "true" : undefined} scroll={false}>
            {allLabel}
          </Link>
        </li>
        {options.map((o) => (
          <li key={o.value}>
            <Link href={hrefFor(o.value)} className={chip(current === o.value)} aria-current={current === o.value ? "true" : undefined} scroll={false}>
              {o.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Suspense boundary is internal so pages can stay fully pre-rendered. */
export function FilterChips(props: ComponentProps<typeof FilterChipsInner>) {
  return (
    <Suspense fallback={<div className="min-h-9" />}>
      <FilterChipsInner {...props} />
    </Suspense>
  );
}
