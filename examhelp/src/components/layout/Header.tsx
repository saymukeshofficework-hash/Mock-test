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
        <div className="current-affairs-brand flex shrink-0 items-center gap-2">
          <MockPageHomeLink />
          <div aria-label="TETTESTHUB" className="shrink-0">
            <Logo />
          </div>
        </div>

        <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search`} role="search" className="current-affairs-search hidden max-w-md flex-1 xl:block">
          <label htmlFor="header-search" className="sr-only">
            {tr(dict.search.label, lang)}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder={tr(dict.search.placeholder, lang)}
              className="h-10 w-full rounded-full border border-ink-200 bg-canvas pr-3 pl-9 text-sm outline-none focus:border-brand-500 focus:bg-surface"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <div className="current-affairs-global-language block">
            <LanguageSwitcher lang={lang} />
          </div>
          <CatalogueHeaderExtras lang={lang} />
          <LoginChip className="hidden xl:inline-flex h-10 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700 hover:bg-brand-100" />
          <CurrentAffairsHeaderLanguage className="hidden xl:inline-flex" />
          <MobileControls lang={lang} />
        </div>
      </div>
      <DesktopNav lang={lang} />
      </div>
      </div>
    </header>
  );
}
