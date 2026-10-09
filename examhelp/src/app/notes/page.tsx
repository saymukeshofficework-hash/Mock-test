import Link from "next/link";
import { FilterChips } from "@/components/exam/FilterChips";
import { NotesCard } from "@/components/notes/NotesCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { EmptyState, PageHeader } from "@/components/ui/Primitives";
import { UrlFilter } from "@/components/ui/UrlFilter";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { getCategories, getNotes } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "MP Exam Notes ₹299 — MPPSC, MPESB, Police, TET, Group Exams",
  description:
    "Exam-oriented PDF notes at ₹299 for Madhya Pradesh exams — MPPSC, MPESB, MP TET, Police, Group exams, Nayab Tahsildar and MP GK. Hindi medium.",
  path: "/notes",
});

export default async function NotesPage() {
  const lang = await getLang();
  const [notes, categories] = await Promise.all([getNotes(), getCategories()]);
  const n = dict.notes;
  const allComingSoon = notes.every((x) => x.status !== "AVAILABLE");

  return (
    <>
      <PageHeader title={tr(n.title, lang)} subtitle={tr(n.subtitle, lang)}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: tr(dict.nav.notes, lang), href: "/notes" }]} />
      </PageHeader>

      <div className="container-page py-8">
        <div className="card p-4 sm:p-5">
          <FilterChips
            label={tr(dict.calendar.category, lang)}
            param="category"
            allLabel={tr(n.allCategories, lang)}
            options={categories.map((c) => ({ value: c.slug, label: tr(c.name, lang) }))}
          />
        </div>

        {allComingSoon && (
          <div className="mt-6">
            <ComingSoon lang={lang} compact message={tr(dict.comingSoon.notes, lang)} notifySubject="Notes launch" />
          </div>
        )}

        <div id="notes-list" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map((note) => (
            <div key={note.id} data-f-item="" data-f-category={note.category}>
              <NotesCard note={note} lang={lang} />
            </div>
          ))}
        </div>
        <UrlFilter
          scope="notes-list"
          params={["category"]}
          empty={
            <EmptyState
              title={tr(n.noNotes, lang)}
              hint={tr(n.noNotesHint, lang)}
              action={
                <Link href="/notes" className="btn-outline">
                  {tr(n.allCategories, lang)}
                </Link>
              }
            />
          }
        />
      </div>
    </>
  );
}
