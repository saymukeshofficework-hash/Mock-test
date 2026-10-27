import { LoginChip } from "./LoginChip";
import { CatalogueHeaderExtras, CurrentAffairsHeaderLanguage, MockPageHomeLink } from "./HeaderClient";
import { Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { dict, tr } from "@/i18n/dictionary";
import type { Lang } from "@/types";
import { DesktopNav, MobileControls } from "./HeaderClient";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-50 pt-3">
      <div className="container-page">
      <div className="rounded-2xl border border-ink-200 bg-surface/95 shadow-[0_6px_24px_rgba(20,24,31,0.07)] backdrop-blur supports-[backdrop-filter]:bg-surface/90">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4">
        <div className="current-affairs-brand flex min-w-0 shrink items-center gap-2">
          <MockPageHomeLink />
          <div aria-label="TETTESTHUB" className="shrink-0">
            <Logo />
          </div>
          <div className="current-affairs-global-language shrink-0">
            <LanguageSwitcher lang={lang} />
          </div>
        </div>

        <DesktopHeaderSearch lang={lang} />

        <div className="flex items-center gap-2">
          <CatalogueHeaderExtras lang={lang} />
          <LoginChip className="hidden xl:inline-flex h-10 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100" />
          <MobileControls lang={lang} />
          <CurrentAffairsHeaderLanguage className="current-affairs-student-language" />
        </div>
      </div>
      <DesktopNav lang={lang} />
      </div>
      </div>
    </header>
  );
}
