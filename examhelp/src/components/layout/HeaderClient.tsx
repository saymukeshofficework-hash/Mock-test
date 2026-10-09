"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { isActive, mobileNav, moreNav, primaryNav } from "@/lib/nav";
import type { Lang } from "@/types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LoginChip } from "./LoginChip";

/** Desktop nav with an accessible "More" dropdown. */
export function DesktopNav({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const moreActive = moreNav.some((i) => isActive(pathname, i.href));

  return (
    <nav aria-label="Primary" className="hidden border-t border-ink-100 xl:block">
      <ul className="flex items-center gap-0.5 overflow-x-auto px-3 py-1 text-[13.5px] sm:px-4">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-lg px-2.5 py-2 font-semibold whitespace-nowrap transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100 hover:text-brand-700"
                }`}
              >
                {tr(item.label, lang)}
              </Link>
            </li>
          );
        })}
        <li ref={ref} className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="more-menu"
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-2 font-semibold whitespace-nowrap ${
              moreActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-100"
            }`}
          >
            {tr(dict.nav.more, lang)}
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {open && (
            <ul id="more-menu" className="card absolute right-0 z-50 mt-1 w-56 p-1.5">
              {moreNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-brand-50 hover:text-brand-700">
                    {tr(item.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** Mobile: Search + Menu buttons and the slide-in drawer. */
export function MobileControls({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="flex items-center gap-1 xl:hidden">
      <LoginChip className="inline-flex h-10 items-center rounded-xl border border-brand-200 bg-brand-50 px-2.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 sm:px-3 sm:text-sm" />
      <Link href="/search" aria-label={tr(dict.nav.search, lang)} className="grid h-11 w-11 place-items-center rounded-xl text-ink-700 hover:bg-ink-100">
        <Search className="h-5 w-5" aria-hidden="true" />
      </Link>
      <button
        ref={triggerRef}
        type="button"
        aria-label={tr(dict.nav.openMenu, lang)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-xl text-ink-700 hover:bg-ink-100"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={tr(dict.nav.menu, lang)} id="mobile-drawer">
          <button type="button" aria-label={tr(dict.nav.closeMenu, lang)} tabIndex={-1} className="absolute inset-0 bg-brand-950/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[86%] max-w-sm flex-col bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-200 px-4 py-3">
              <LanguageSwitcher lang={lang} />
              <button
                ref={closeRef}
                type="button"
                aria-label={tr(dict.nav.closeMenu, lang)}
                onClick={() => setOpen(false)}
                className="grid h-11 w-11 place-items-center rounded-xl text-ink-700 hover:bg-ink-100"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-2 py-2">
              <ul>
                {mobileNav.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-12 items-center rounded-xl px-3 text-[15px] font-medium ${
                          active ? "bg-brand-50 text-brand-700" : "text-ink-900 hover:bg-ink-100"
                        }`}
                      >
                        {tr(item.label, lang)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-2 border-t border-ink-200 px-3 pt-3 pb-6">
                <ul className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-ink-500">
                  {moreNav.slice(2).map((i) => (
                    <li key={i.href}>
                      <Link href={i.href} onClick={() => setOpen(false)} className="hover:text-brand-700">
                        {tr(i.label, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
