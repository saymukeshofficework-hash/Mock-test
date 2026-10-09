import Link from "next/link";
import { Search } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import type { Lang } from "@/types";

const examples = ["MP TET", "Police Constable", "MPPSC", "Group 2", "Group 3", "Nayab Tahsildar", "High Court", "Notes"];

/** Large search box (spec §8). Plain GET form: works without JavaScript. */
export function SearchBox({ lang, defaultValue = "", autoFocus = false }: { lang: Lang; defaultValue?: string; autoFocus?: boolean }) {
  return (
    <div>
      <form action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search`} role="search" className="card flex items-center gap-2 p-2 shadow-[var(--shadow-lift)]">
        <label htmlFor="big-search" className="sr-only">
          {tr(dict.search.label, lang)}
        </label>
        <Search className="ml-2 h-5 w-5 shrink-0 text-ink-500" aria-hidden="true" />
        <input
          id="big-search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          placeholder={tr(dict.search.placeholder, lang)}
          className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink-500"
        />
        <button type="submit" className="btn-primary shrink-0">
          <span className="hidden sm:inline">{tr(dict.nav.search, lang)}</span>
          <Search className="h-4 w-4 sm:hidden" aria-hidden="true" />
          <span className="sr-only sm:hidden">{tr(dict.nav.search, lang)}</span>
        </button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-500">{tr(dict.search.popular, lang)}</span>
        {examples.map((q) => (
          <Link key={q} href={`/search?q=${encodeURIComponent(q)}`} className="chip bg-surface text-ink-700 ring-1 ring-ink-200 hover:text-brand-700 hover:ring-brand-500">
            {q}
          </Link>
        ))}
      </div>
    </div>
  );
}
