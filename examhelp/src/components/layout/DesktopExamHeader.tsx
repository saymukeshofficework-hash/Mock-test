"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, LayoutGrid } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LoginChip } from "./LoginChip";
import type { Lang } from "@/types";

const TARGET = /(?:^|\/)(?:mp-high-court-assistant-grade-3-mock-tests|mp-police-subedar-asi-mock-tests|mp-police-constable-gd-mock-tests|mp-police-driver-mock-tests|mp-police-si-mock-tests|mp-police-asi-steno-mock-tests|mp-grameen-bank-mock-tests|rrb-station-master-mock-tests|rrb-ntpc-(?:graduate|undergraduate)-mock-tests)(?:\.html)?(?:\/.*)?\/?$/;

// Laptop header only; these pages keep their own phone header.
const DESKTOP_ONLY = /(?:^|\/)(?:tet-mock-tests|current-affairs)\/?$/;

export function isDesktopOnlyHeaderPage(pathname: string) {
  return DESKTOP_ONLY.test(pathname);
}

export function isDesktopExamHeaderPage(pathname: string) {
  return TARGET.test(pathname) || DESKTOP_ONLY.test(pathname);
}

/** Single-row desktop navigation for all requested mock-test exam pages. */
export function DesktopExamHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<"hi" | "en">(lang === "en" ? "en" : "hi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLanguage(saved);
    } catch { /* storage may be unavailable */ }
    // Keep the header toggle in sync when the page body changes the language.
    const onChange = (e: Event) => {
      const value = (e as CustomEvent).detail;
      if (value === "hi" || value === "en") setLanguage(value);
    };
    window.addEventListener("testhub-language-change", onChange);
    return () => window.removeEventListener("testhub-language-change", onChange);
  }, []);

  const chooseLanguage = (value: "hi" | "en") => {
    setLanguage(value);
    try {
      localStorage.setItem("testhub_lang_pref", value);
      document.cookie = `testhub_lang=${value}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = value;
    } catch { /* storage may be unavailable */ }
    window.dispatchEvent(new CustomEvent("testhub-language-change", { detail: value }));
  };

  if (!isDesktopExamHeaderPage(pathname)) return null;

  const navClass = "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/30 px-2.5 text-xs font-bold text-white shadow-sm transition hover:-translate-y-px hover:brightness-110";
  return (
    <div className="hidden lg:block">
      <div className="container-page py-2">
        <div className="flex h-[68px] w-full flex-nowrap items-center gap-2 overflow-visible rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 px-3 text-white shadow-lg">
          <div aria-label="TET TestHub" className="flex shrink-0 items-center rounded-lg px-1.5 py-1">
            <span className="[&_svg]:h-7 [&_svg]:w-7"><Logo light /></span>
          </div>
          {/* A div, not <nav>: globals.css hides every `header nav` on mock-test list pages. */}
          <div role="navigation" aria-label="Exam navigation" className="flex shrink-0 flex-nowrap items-center gap-1.5">
            <Link href="https://tettesthub.in/index.html" className={`${navClass} bg-emerald-500`}><Home className="h-4 w-4 shrink-0" aria-hidden="true" /><span>Home</span></Link>
            <Link href="https://tettesthub.in/course-folders.html" className={`${navClass} bg-violet-500`}><LayoutGrid className="h-4 w-4 shrink-0" aria-hidden="true" /><span>All Courses</span></Link>
            <Link href="/dashboard.html" className={`${navClass} bg-sky-500`}><ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" /><span>My Test</span></Link>
            <LoginChip mode="logout" className={`${navClass} bg-rose-500`} />
          </div>
          <div className="ml-auto flex min-w-0 shrink-0 flex-nowrap items-center gap-1.5">
            <div role="group" aria-label="Question language / प्रश्नों की भाषा" className="inline-flex h-9 shrink-0 items-center rounded-lg border border-white/70 bg-white p-0.5 text-indigo-950">
              <button type="button" onClick={() => chooseLanguage("hi")} aria-pressed={language === "hi"} className={`h-7 whitespace-nowrap rounded-md px-2 text-xs font-semibold ${language === "hi" ? "bg-indigo-700 text-white" : "text-indigo-950 hover:bg-indigo-100"}`}>हिंदी</button>
              <button type="button" onClick={() => chooseLanguage("en")} aria-pressed={language === "en"} className={`h-7 whitespace-nowrap rounded-md px-2 text-xs font-semibold ${language === "en" ? "bg-indigo-700 text-white" : "text-indigo-950 hover:bg-indigo-100"}`}>English</button>
            </div>
            <LoginChip mode="identity" className="inline-flex h-9 max-w-[240px] shrink-0 items-center overflow-hidden rounded-lg border border-amber-200 bg-amber-300 px-2.5 text-xs font-semibold text-indigo-950 shadow-sm hover:bg-amber-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
