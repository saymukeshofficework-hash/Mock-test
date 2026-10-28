"use client";

import { usePathname } from "next/navigation";
import { DesktopExamHeader, isDesktopExamHeaderPage } from "./DesktopExamHeader";
import { LoginChip } from "./LoginChip";
import { CatalogueHeaderExtras, CurrentAffairsHeaderLanguage, MockPageHomeLink, DesktopHeaderSearch, ExamHeaderLanguage } from "./HeaderClient";
import { Logo } from "@/components/brand/Logo";
import type { Lang } from "@/types";
import { DesktopNav, MobileControls } from "./HeaderClient";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const examPage = isDesktopExamHeaderPage(pathname);
  return (
    <header className="sticky top-0 z-50 pt-3" data-tth-no-translate={examPage ? "true" : undefined}>
      {examPage && <DesktopExamHeader lang={lang} />}
      <div className={examPage ? "lg:hidden" : ""}>
      <div className="container-page">
      <div className="rounded-2xl border border-ink-200 bg-surface/95 shadow-[0_6px_24px_rgba(20,24,31,0.07)] backdrop-blur supports-[backdrop-filter]:bg-surface/90">
      <div className={examPage ? "flex min-h-0 flex-nowrap items-center justify-start gap-1 px-2 py-1 sm:px-3 lg:flex-wrap lg:justify-between lg:gap-2 lg:py-2" : "flex min-h-16 flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4"}>
        <div className={examPage ? "current-affairs-brand flex min-w-0 shrink items-center gap-1" : "current-affairs-brand flex min-w-0 shrink items-center gap-2"}>
          {!examPage && <MockPageHomeLink />}
          <div aria-label="TETTESTHUB" className="shrink-0">
            <Logo compact={examPage} />
          </div>
          {examPage ? (
            <>
              <ExamHeaderLanguage className="lg:hidden" />
              <LoginChip mode="identity" className="inline-flex h-8 max-w-[88px] shrink-0 items-center overflow-hidden rounded-lg border border-amber-200 bg-amber-300 px-1.5 text-[10px] font-bold text-indigo-950 shadow-sm lg:hidden" />
            </>
          ) : (
            <div className="current-affairs-global-language shrink-0">
              <LanguageSwitcher lang={lang} />
            </div>
          )}
        </div>

        <DesktopHeaderSearch lang={lang} />

        <div className={examPage ? "hidden lg:flex items-center gap-2" : "flex items-center gap-2"}>
          <CatalogueHeaderExtras lang={lang} />
          <LoginChip className="hidden xl:inline-flex h-10 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100" />
          <MobileControls lang={lang} />
          <CurrentAffairsHeaderLanguage className="current-affairs-student-language" />
        </div>
      </div>
      <DesktopNav lang={lang} />
      </div>
      </div>
      </div>
    </header>
  );
}
