"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ComponentProps, type ReactNode } from "react";

/**
 * Hides items that don't match the URL filters. Items carry data attributes,
 * e.g. <div data-f-category="police" data-f-org="MPESB">. For each active
 * param we inject a CSS rule, so filtering needs no re-render of the list.
 *
 * `scope` is the id of the list container; `empty` renders when nothing matches.
 */
function UrlFilterInner({ scope, params, empty, countLabel }: { scope: string; params: string[]; empty: ReactNode; countLabel?: boolean }) {
  const sp = useSearchParams();
  const active = params.map((p) => [p, sp.get(p)] as const).filter(([, v]) => v && /^[A-Za-z0-9_-]{1,40}$/.test(v)) as [string, string][];
  const [counts, setCounts] = useState<{ shown: number; total: number } | null>(null);

  const css = active
    .map(([p, v]) => `#${scope} [data-f-${p}]:not([data-f-${p}~="${v}"]){display:none!important}`)
    .join("\n");

  useEffect(() => {
    const root = document.getElementById(scope);
    if (!root) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-f-item]")];
    const shown = items.filter((el) => getComputedStyle(el).display !== "none").length;
    setCounts({ shown, total: items.length });
  }, [scope, css]);

  return (
    <>
      {css && <style>{css}</style>}
      {countLabel && counts && (
        <p className="text-sm text-ink-500" aria-live="polite">
          {counts.shown} / {counts.total}
        </p>
      )}
      {counts && counts.shown === 0 && counts.total > 0 && <div className="mt-2">{empty}</div>}
    </>
  );
}

export function UrlFilter(props: ComponentProps<typeof UrlFilterInner>) {
  return (
    <Suspense fallback={null}>
      <UrlFilterInner {...props} />
    </Suspense>
  );
}
