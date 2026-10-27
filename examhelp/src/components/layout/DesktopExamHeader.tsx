"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Contact } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LoginChip } from "./LoginChip";
import type { Lang } from "@/types";

const TARGET = /(?:^|\/)(?:mp-high-court-assistant-grade-3-mock-tests|mp-police-subedar-asi-mock-tests|mp-police-constable-gd-mock-tests|mp-police-driver-mock-tests|mp-police-si-mock-tests|mp-police-asi-steno-mock-tests|mp-grameen-bank-mock-tests|rrb-station-master-mock-tests|rrb-ntpc-(?:graduate|undergraduate)-mock-tests)(?:\/index\.html)?\/?$/;

export function isDesktopExamHeaderPage(pathname: string) {
  return TARGET.test(pathname);
}

/** Compact single-row navigation for desktop/laptop exam pages only. */
export function DesktopExamHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [language, setLanguage] = useState<"hi" | "en">(lang === "en" ? "en" : "hi");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLanguage(saved);
    } catch { /* storage may be unavailable */ }
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

  return (
    <div className="hidden lg:block">
      <div className="container-page py-2">
        <div className="flex h-[68px] w-full flex-nowrap items-center gap-3 overflow-visible rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 px-3 text-white shadow-lg">
          <Link href="https://tettesthub.in/index.html" aria-label="TET TestHub Home" className="flex shrink-0 items-center rounded-lg px-1.5 py-1 hover:bg-white/10">
            <span className="[&_svg]:h-7 [&_svg]:w-7"><Logo light /></span>
          </Link>
          <nav aria-label="Exam navigation" className="flex shrink-0 flex-nowrap items-center gap-1.5">
            <Link href="https://tettesthub.in/index.html" className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/25 bg-white/15 px-2.5 text-sm font-semibold hover:bg-white/25"><Home className="h-4 w-4 shrink-0" />{language === "hi" ? "होम" : "Home"}</Link>
            <Link href="/my-tests.html" className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/25 bg-white/15 px-2.5 text-sm font-semibold hover:bg-white/25"><ClipboardList className="h-4 w-4 shrink-0" />{language === "hi" ? "माई टेस्ट" : "My Test"}</Link>
            <Link href="/contact.html" className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/25 bg-white/15 px-2.5 text-sm font-semibold hover:bg-white/25"><Contact className="h-4 w-4 shrink-0" />{language === "hi" ? "संपर्क" : "Contact"}</Link>
          </nav>
          <div className="ml-auto flex min-w-0 shrink-0 flex-nowrap items-center gap-2">
            <div role="group" aria-label="Language / भाषा" className="inline-flex h-10 shrink-0 items-center rounded-lg border border-white/70 bg-white p-0.5 text-indigo-950">
              <button type="button" onClick={() => chooseLanguage("hi")} aria-pressed={language === "hi"} className={`h-8 whitespace-nowrap rounded-md px-2 text-xs font-semibold ${language === "hi" ? "bg-indigo-700 text-white" : "text-indigo-950 hover:bg-indigo-100"}`}>हिंदी</button>
              <button type="button" onClick={() => chooseLanguage("en")} aria-pressed={language === "en"} className={`h-8 whitespace-nowrap rounded-md px-2 text-xs font-semibold ${language === "en" ? "bg-indigo-700 text-white" : "text-indigo-950 hover:bg-indigo-100"}`}>English</button>
            </div>
            {/* Keep the existing yellow account chip as the single Student ID/account display. */}
            <LoginChip className="inline-flex h-10 max-w-[190px] shrink-0 items-center overflow-hidden rounded-lg border border-amber-200 bg-amber-300 px-3 text-sm font-semibold text-indigo-950 shadow-sm hover:bg-amber-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
