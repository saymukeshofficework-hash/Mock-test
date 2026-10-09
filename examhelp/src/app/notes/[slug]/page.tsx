import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, FileText, ImageIcon, Languages, Lock, Target } from "lucide-react";
import { NotesCard, PriceBadge, ProductStatusBadge } from "@/components/notes/NotesCard";
import { PurchaseButton } from "@/components/notes/PurchaseButton";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { FaqList } from "@/components/ui/FaqList";
import { JsonLd } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { langLabel } from "@/lib/format";
import { getExamBySlug, getFaqs, getNoteBySlug, getNotes } from "@/lib/repo";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getNotes()).map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) return {};
  return pageMeta({
    title: `${note.title.en} — ₹${note.price.amount} PDF`,
    description: `${note.shortDescription.en} ${note.format} notes for ₹${note.price.amount}.`,
    path: `/notes/${note.slug}`,
  });
}

export default async function NoteProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);
  if (!note) notFound();

  const lang = await getLang();
  const n = dict.notes;
  const [exams, faqs, allNotes] = await Promise.all([
    Promise.all(note.examSlugs.map((s) => getExamBySlug(s))),
    getFaqs("notes"),
    getNotes(),
  ]);
  const targetExams = exams.filter((e): e is NonNullable<typeof e> => !!e);
  const related = allNotes.filter((x) => x.id !== note.id && (x.category === note.category || x.examSlugs.some((s) => note.examSlugs.includes(s)))).slice(0, 3);
  const available = note.status === "AVAILABLE";

  // Product schema only when the product can actually be bought.
  const productSchema = available
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: note.title.en,
        description: note.shortDescription.en,
        brand: { "@type": "Brand", name: site.name },
        offers: {
          "@type": "Offer",
          price: note.price.amount,
          priceCurrency: note.price.currency,
          availability: "https://schema.org/InStock",
          url: `${site.url}/notes/${note.slug}`,
        },
      }
    : null;

  return (
    <>
      <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-canvas">
        <div className="container-page py-8">
          <Breadcrumbs
            items={[
              { label: tr(dict.nav.home, lang), href: "/" },
              { label: tr(dict.nav.notes, lang), href: "/notes" },
              { label: tr(note.title, lang), href: `/notes/${note.slug}` },
            ]}
          />
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <ProductStatusBadge status={note.status} lang={lang} />
              <span className="chip bg-brand-50 text-brand-700">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {note.format}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-extrabold text-brand-900 sm:text-3xl">{tr(note.title, lang)}</h1>
            <p className="mt-2 text-ink-700">{tr(note.shortDescription, lang)}</p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { Icon: Target, label: n.targetExam, value: targetExams.map((e) => e.shortName).join(", ") || "—" },
              { Icon: Languages, label: n.language, value: note.languages.map(langLabel).join(" / ") },
              { Icon: FileText, label: n.format, value: note.format },
              { Icon: FileText, label: n.pages, value: note.pages ? String(note.pages) : tr(n.tba, lang) },
            ].map(({ Icon, label, value }) => (
              <div key={label.en} className="card p-4">
                <dt className="flex items-center gap-1.5 text-xs text-ink-500">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tr(label, lang)}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink-900">{value}</dd>
              </div>
            ))}
          </dl>

          {!available && <ComingSoon lang={lang} message={tr(dict.comingSoon.notes, lang)} notifySubject={`Notes: ${note.title.en}`} />}

          <section aria-labelledby="get-h" className="card p-6">
            <h2 id="get-h" className="text-xl font-bold text-brand-900">
              {tr(n.whatYouGet, lang)}
            </h2>
            <ul className="mt-4 space-y-2">
              {n.whatList.map((w) => (
                <li key={w.en} className="flex items-start gap-2 text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-700" aria-hidden="true" />
                  {tr(w, lang)}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="topics-h" className="card p-6">
            <h2 id="topics-h" className="text-xl font-bold text-brand-900">
              {tr(n.topics, lang)}
            </h2>
            {note.topics.length ? (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {note.topics.map((t) => (
                  <li key={t.en} className="flex items-center gap-2 text-ink-700">
                    <CheckCircle2 className="h-4 w-4 text-brand-600" aria-hidden="true" />
                    {tr(t, lang)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-ink-500">{tr(n.topicsPending, lang)}</p>
            )}
          </section>

          <section aria-labelledby="sample-h" className="card p-6">
            <h2 id="sample-h" className="text-xl font-bold text-brand-900">
              {tr(n.samplePages, lang)}
            </h2>
            {note.samplePages.length ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {note.samplePages.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`} alt={`${tr(n.samplePages, lang)} ${i + 1}`} loading="lazy" className="rounded-lg border border-ink-200" />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="grid aspect-[3/4] place-items-center rounded-lg border border-dashed border-ink-300 bg-canvas text-ink-300">
                    <ImageIcon className="h-8 w-8" aria-hidden="true" />
                  </div>
                ))}
                <p className="col-span-3 text-sm text-ink-500">{tr(n.samplesPending, lang)}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="ben-h" className="card p-6">
            <h2 id="ben-h" className="text-xl font-bold text-brand-900">
              {tr(n.benefits, lang)}
            </h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {n.benefitsList.map((b) => (
                <li key={b.en} className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-sm text-ink-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {tr(b, lang)}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="nfaq-h">
            <h2 id="nfaq-h" className="mb-4 text-xl font-bold text-brand-900">
              {tr(dict.nav.faq, lang)}
            </h2>
            <FaqList faqs={faqs} lang={lang} />
          </section>

          {targetExams.length > 0 && (
            <section aria-labelledby="te-h">
              <h2 id="te-h" className="mb-3 text-xl font-bold text-brand-900">
                {tr(n.targetExam, lang)}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {targetExams.map((e) => (
                  <li key={e.id}>
                    <Link href={`/exams/${e.slug}`} className="chip min-h-9 bg-surface px-4 text-sm text-brand-700 ring-1 ring-brand-100 hover:bg-brand-50">
                      {e.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Purchase panel */}
        <aside id="buy" className="lg:sticky lg:top-32 lg:self-start">
          <div className="card p-6">
            <PriceBadge price={note.price} lang={lang} />
            <p className="mt-1 text-sm text-ink-500">
              {note.format} · {note.languages.map(langLabel).join(" / ")}
            </p>
            <div className="mt-5">
              <PurchaseButton productSlug={note.slug} available={available} lang={lang} />
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-ink-500">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {tr(n.purchaseNote, lang)}
            </p>
            <p className="mt-2 text-xs text-ink-500">
              <Link href="/refund-policy" className="underline underline-offset-2">
                {tr(dict.nav.refund, lang)}
              </Link>
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-page pb-8" aria-labelledby="rel-h">
          <h2 id="rel-h" className="mb-4 text-xl font-bold text-brand-900">
            {tr(dict.exam.relatedNotes, lang)}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <NotesCard key={r.id} note={r} lang={lang} />
            ))}
          </div>
        </section>
      )}

      <div className="h-16 lg:hidden" aria-hidden="true" />
      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-14 z-30 border-t border-ink-200 bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <PriceBadge price={note.price} lang={lang} />
          <a href="#buy" className={available ? "btn-primary" : "btn-outline"}>
            {available ? tr(n.buyNow, lang) : tr(n.comingSoon, lang)}
          </a>
        </div>
      </div>
      {productSchema && <JsonLd data={productSchema} />}
    </>
  );
}
