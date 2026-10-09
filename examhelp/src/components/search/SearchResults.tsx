"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CategoryCard } from "@/components/exam/CategoryCard";
import { ExamCard } from "@/components/exam/ExamCard";
import { SearchBox } from "@/components/home/SearchBox";
import { NotesCard } from "@/components/notes/NotesCard";
import { EmptyState } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { searchSync } from "@/lib/search";
import type { Lang } from "@/types";

/** Client-side search over the (small) static dataset — works on any host. */
function Results({ lang }: { lang: Lang }) {
  const q = (useSearchParams().get("q") ?? "").slice(0, 100).trim();
  const hits = q ? searchSync(q) : [];
  const exams = hits.flatMap((h) => (h.kind === "exam" ? [h.exam] : []));
  const notes = hits.flatMap((h) => (h.kind === "note" ? [h.note] : []));
  const cats = hits.flatMap((h) => (h.kind === "category" ? [h.category] : []));

  return (
    <>
      <div className="max-w-3xl">
        <SearchBox key={q} lang={lang} defaultValue={q} autoFocus={!q} />
      </div>
      {!q ? (
        <p className="mt-8 text-ink-500">{tr(dict.search.empty, lang)}</p>
      ) : hits.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={`${tr(dict.search.noResults, lang)}: “${q}”`}
            hint={tr(dict.search.noResultsHint, lang)}
            action={
              <Link href="/exams" className="btn-outline">
                {tr(dict.exam.allExams, lang)}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <p className="text-sm text-ink-500" role="status">
            {tr(dict.search.resultsFor, lang)} “{q}” — {hits.length}
          </p>
          {cats.length > 0 && (
            <section aria-label={tr(dict.nav.categories, lang)}>
              <h2 className="mb-3 text-lg font-bold text-brand-900">{tr(dict.nav.categories, lang)}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cats.map((c) => (
                  <CategoryCard key={c.slug} category={c} lang={lang} />
                ))}
              </div>
            </section>
          )}
          {exams.length > 0 && (
            <section aria-label={tr(dict.nav.exams, lang)}>
              <h2 className="mb-3 text-lg font-bold text-brand-900">{tr(dict.nav.exams, lang)}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((e) => (
                  <ExamCard key={e.id} exam={e} lang={lang} />
                ))}
              </div>
            </section>
          )}
          {notes.length > 0 && (
            <section aria-label={tr(dict.nav.notes, lang)}>
              <h2 className="mb-3 text-lg font-bold text-brand-900">{tr(dict.nav.notes, lang)}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {notes.map((n) => (
                  <NotesCard key={n.id} note={n} lang={lang} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

export function SearchResults({ lang }: { lang: Lang }) {
  return (
    <Suspense fallback={<div className="card h-16 max-w-3xl" />}>
      <Results lang={lang} />
    </Suspense>
  );
}
