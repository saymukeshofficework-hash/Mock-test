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

/** Colorful desktop-only navigation for all requested mock-test exam pages. */
export function DesktopExamHeader({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [studentId, setStudentId] = useState("");
  const [language, setLanguage] = useState<"hi" | "en">(lang === "en" ? "en" : "hi");

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem("tth_user") || "null");
      setStudentId(typeof cached?.id === "string" ? cached.id : "");
      const saved = localStorage.getItem("testhub_lang_pref");
      if (saved === "hi" || saved === "en") setLanguage(saved);
    } catch { /* ignore unavailable or malformed local storage */ }
  }, []);

  const chooseLanguage = (value: "hi" | "en") => {
    setLanguage(value);
    try {
      localStorage.setItem("testhub_lang_pref", value);
      document.cookie = `testhub_lang=${value}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = value;
    } catch { /* ignore unavailable storage */ }
    window.dispatchEvent(new CustomEvent("testhub-language-change", { detail: value }));
  };

  if (!isDesktopExamHeaderPage(pathname)) return null;

  return (
    <div className="hidden xl:block">
      <div className="container-page py-2">
        <div className="flex min-h-[66px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-700 px-5 py-3 text-white shadow-lg">
          <Link href="https://tettesthub.in/index.html" aria-label="TET TestHub Home" className="shrink-0 rounded-xl px-2 py-1 hover:bg-white/10">
            <span className="[&_svg]:h-8 [&_svg]:w-8"><Logo light /></span>
          </Link>
          <nav aria-label="Exam navigation" className="flex flex-wrap items-center justify-center gap-2">
            <Link href="https://tettesthub.in/index.html" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><Home className="h-4 w-4" />{language === "hi" ? "होम" : "Home"}</Link>
            <Link href="/my-tests.html" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><ClipboardList className="h-4 w-4" />{language === "hi" ? "माई टेस्ट" : "My Test"}</Link>
            <Link href="/contact.html" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-sm font-bold hover:bg-white/25"><Contact className="h-4 w-4" />{language === "hi" ? "संपर्क" : "Contact"}</Link>
          </nav>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="rounded-lg border border-white/25 bg-white/10 px-3 py-2 text-xs font-semibold" aria-label="Student ID">
              <span className="opacity-80">{language === "hi" ? "छात्र ID" : "Student ID"}:</span>{" "}
              <span className="font-extrabold">{studentId || "—"}</span>
            </div>
            <div className="rounded-xl bg-white/95 p-0.5 text-indigo-900 [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!text-indigo-900 [&_button]:!hover:bg-indigo-50">
              <button type="button" onClick={() => chooseLanguage("hi")} aria-pressed={language === "hi"} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "hi" ? "bg-indigo-700 text-white" : "text-indigo-900"}`}>हिंदी</button>
              <button type="button" onClick={() => chooseLanguage("en")} aria-pressed={language === "en"} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${language === "en" ? "bg-indigo-700 text-white" : "text-indigo-900"}`}>English</button>
            </div>
            <LoginChip className="inline-flex min-h-10 items-center rounded-xl border border-amber-200 bg-amber-300 px-3 py-2 text-sm font-extrabold text-indigo-950 shadow-sm hover:bg-amber-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
