"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Search, X, Moon, Sun, ShoppingBag } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { isActive, mobileNav, moreNav, primaryNav } from "@/lib/nav";
import type { Lang } from "@/types";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LoginChip } from "./LoginChip";

/** Small Home option before the TETTESTHUB logo on mock-test catalogues. */
export function MockPageHomeLink() {
  const pathname = usePathname();
  const isMockTestList = /(?:^|\/)(?:courses|exams|all-test|all-tests|tests|test-series|my-tests?|dashboard|tet-mock-tests|mp-high-court-assistant-grade-3-mock-tests|mp-police-constable-gd-mock-tests|mp-police-subedar-asi-mock-tests|mp-police-driver-mock-tests|mp-police-si-mock-tests|mp-grameen-bank-mock-tests|rrb-ntpc-(?:graduate|undergraduate)-mock-tests)(?:\/index\.html)?\/?$/.test(pathname);
  if (!isMockTestList || /(?:^|\/)(?:courses|exams|all-test|all-tests|tests)(?:\.html)?\/?$/.test(pathname)) return null;
  return <a href="https://tettesthub.in/index.html" aria-label="बैंगनी होमपेज पर जाएँ" title="होम" className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 text-xs font-bold text-brand-700 hover:bg-brand-100">⌂ <span>होम</span></a>;
}

/** Exam catalogue routes where the top search and menu controls should be omitted. */
function isTargetExamPage(pathname: string) {
  return /(?:^|\/)(?:mp-high-court-assistant-grade-3-mock-tests|mp-police-subedar-asi-mock-tests|mp-police-constable-gd-mock-tests|mp-police-driver-mock-tests|mp-police-si-mock-tests|mp-police-asi-steno-mock-tests|mp-grameen-bank-mock-tests|rrb-station-master-mock-tests|rrb-ntpc-(?:graduate|undergraduate)-mock-tests)(?:\.html)?(?:\/.*)?\/?$/.test(pathname);
}

/** Desktop search is also omitted on the requested exam pages. */
export function DesktopHeaderSearch({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  if (isTargetExamPage(pathname)) return null;
  return (
    <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search`} role="search" className="current-affairs-search hidden max-w-md flex-1 xl:block">
      <label htmlFor="header-search" className="sr-only">{tr(dict.search.label, lang)}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
        <input id="header-search" name="q" type="search" placeholder={tr(dict.search.placeholder, lang)} className="h-10 w-full rounded-full border border-ink-200 bg-canvas pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:bg-surface" />
      </div>
    </form>
  );
}

/** Compact controls shown on the All Tests / Courses catalogue. */
export function CatalogueHeaderExtras({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const isCataloguePage = /(?:^|\/)(?:courses|exams|all-test|all-tests|tests)(?:\.html)?\/?$/.test(pathname);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tth-theme");
      const enabled = saved === "dark";
      setDark(enabled);
      if (saved) document.documentElement.dataset.theme = saved;
      else delete document.documentElement.dataset.theme;
    } catch { /* ignore unavailable storage */ }
  }, []);
  function toggleTheme() {
    const next = dark ? "light" : "dark";
    setDark(next === "dark");
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("tth-theme", next); } catch { /* ignore unavailable storage */ }
  }
  if (!isCataloguePage) return null;
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button type="button" onClick={toggleTheme} aria-label={dark ? "Light mode" : "Dark mode"} title={dark ? "Light mode" : "Dark mode"} className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-700 hover:bg-ink-100">
        {dark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
      </button>
      <Link href="/dashboard.html" title={lang === "hi" ? "मेरी खरीदारी" : "My Purchase"} aria-label="My Purchase" className="inline-flex h-9 items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2 text-xs font-bold text-brand-700 hover:bg-brand-100">
        <ShoppingBag className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">My Purchase</span>
      </Link>
    </div>
  );
}
/** Language control for the Current Affairs header in the static site build. */
export function CurrentAffairsHeaderLanguage({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const isCurrentAffairs = /(?:^|\/)current-affairs\/?$/.test(pathname);
  const [lang, setLang] = useState<"hi" | "en">("hi");
  useEffect(() => {
    if (!isCurrentAffairs) return;
    document.body.classList.add("current-affairs-page");
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLang(saved);
    } catch { /* ignore */ }
    return () => document.body.classList.remove("current-affairs-page");
  }, [isCurrentAffairs]);
  if (!isCurrentAffairs) return null;
  const choose = (value: "hi" | "en") => {
    setLang(value);
    try { localStorage.setItem("testhub_lang_pref", value); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("testhub-language-change", { detail: value }));
  };
  return (
    <div role="group" aria-label="भाषा / Language" className={`inline-flex shrink-0 items-center rounded-lg border border-ink-200 bg-surface p-0.5 ${className}`}>
      <button type="button" onClick={() => choose("hi")} aria-pressed={lang === "hi"} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${lang === "hi" ? "bg-brand-700 text-white" : "text-ink-700"}`}>हिंदी</button>
      <button type="button" onClick={() => choose("en")} aria-pressed={lang === "en"} className={`rounded-md px-2 py-1 text-[11px] font-semibold ${lang === "en" ? "bg-brand-700 text-white" : "text-ink-700"}`}>English</button>
    </div>
  );
}


/** Compact, static-export-safe language switcher for every mock-test header. */
export function ExamHeaderLanguage({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState<"hi" | "en">("hi");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLanguage(saved);
    } catch { /* storage may be unavailable */ }
    const onChange = (e: Event) => {
      const value = (e as CustomEvent).detail;
      if (value === "hi" || value === "en") setLanguage(value);
    };
    window.addEventListener("testhub-language-change", onChange);
    return () => window.removeEventListener("testhub-language-change", onChange);
  }, []);
  const choose = (value: "hi" | "en") => {
    setLanguage(value);
    try {
      localStorage.setItem("testhub_lang_pref", value);
      document.cookie = "testhub_lang=" + value + "; path=/; max-age=31536000; samesite=lax";
    } catch { /* storage may be unavailable */ }
    window.dispatchEvent(new CustomEvent("testhub-language-change", { detail: value }));
  };
  return (
    <div role="group" aria-label="Question language / प्रश्नों की भाषा" data-tth-no-translate="true"
      className={"inline-flex h-8 shrink-0 items-center rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-600 to-fuchsia-600 p-0.5 shadow-sm " + className}>
      <button type="button" onClick={() => choose("hi")} aria-pressed={language === "hi"}
        className={"h-6 whitespace-nowrap rounded-md px-1.5 text-[11px] font-bold transition-colors " + (language === "hi" ? "bg-white text-indigo-800 shadow" : "text-white hover:bg-white/15")}>हिंदी</button>
      <button type="button" onClick={() => choose("en")} aria-pressed={language === "en"}
        className={"h-6 whitespace-nowrap rounded-md px-1.5 text-[11px] font-bold transition-colors " + (language === "en" ? "bg-white text-indigo-800 shadow" : "text-white hover:bg-white/15")}>English</button>
    </div>
  );
}

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
  if (/(?:^|\/)(?:courses|exams|all-test|all-tests|tests)(?:\.html)?\/?$/.test(pathname)) return null;

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
  const isMockTestList = /(?:^|\/)(?:courses|exams|test-series|my-tests?|dashboard|tet-mock-tests|mp-high-court-assistant-grade-3-mock-tests|mp-police-constable-gd-mock-tests|mp-police-subedar-asi-mock-tests|mp-police-driver-mock-tests|mp-police-si-mock-tests|mp-grameen-bank-mock-tests|rrb-ntpc-(?:graduate|undergraduate)-mock-tests)(?:\/index\.html)?\/?$/.test(pathname);
  const isCurrentAffairs = /(?:^|\/)current-affairs\/?$/.test(pathname);
  const hideExamHeaderControls = isTargetExamPage(pathname);
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
      {!hideExamHeaderControls && <LoginChip className="inline-flex h-8 max-w-[118px] items-center overflow-hidden rounded-lg border border-brand-200 bg-brand-50 px-1.5 text-[10px] font-semibold text-brand-700 hover:bg-brand-100" />}
      {!hideExamHeaderControls && (
      <Link href="/search" aria-label={tr(dict.nav.search, lang)} className="current-affairs-search-icon grid h-9 w-9 place-items-center rounded-lg text-ink-700 hover:bg-ink-100">
        <Search className="h-5 w-5" aria-hidden="true" />
      </Link>
      )}
      {!hideExamHeaderControls && !isMockTestList && !isCurrentAffairs && <button
        ref={triggerRef}
        type="button"
        aria-label={tr(dict.nav.openMenu, lang)}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={() => setOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-xl text-ink-700 hover:bg-ink-100"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>}

      {!hideExamHeaderControls && !isMockTestList && !isCurrentAffairs && open && (
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