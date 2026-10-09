import Link from "next/link";
import { FileText, Languages, ArrowRight } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { formatINR, langLabel } from "@/lib/format";
import type { Lang, NoteProduct, ProductStatus } from "@/types";

export function PriceBadge({ price, lang }: { price: NoteProduct["price"]; lang: Lang }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="text-2xl font-extrabold text-brand-900">{formatINR(price.amount, lang)}</span>
      {price.originalAmount && price.originalAmount > price.amount && (
        <span className="text-sm text-ink-500 line-through">{formatINR(price.originalAmount, lang)}</span>
      )}
    </span>
  );
}

export function ProductStatusBadge({ status, lang }: { status: ProductStatus; lang: Lang }) {
  const n = dict.notes;
  if (status === "AVAILABLE") return <span className="chip bg-success-50 text-success-700">{tr(n.available, lang)}</span>;
  if (status === "AVAILABLE_SOON") return <span className="chip bg-brand-50 text-brand-700">{tr(n.availableSoon, lang)}</span>;
  return <span className="chip bg-accent-100 text-accent-700">{tr(n.comingSoon, lang)}</span>;
}

/** ₹299 notes product card (spec §13). No fake download links. */
export function NotesCard({ note, lang }: { note: NoteProduct; lang: Lang }) {
  const n = dict.notes;
  const href = note.landingPath ?? `/notes/${note.slug}`;
  const available = note.status === "AVAILABLE";
  return (
    <article className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="relative flex h-28 items-end bg-gradient-to-br from-brand-800 to-brand-600 p-4">
        <span className="chip absolute top-3 left-3 bg-white/15 text-white ring-1 ring-white/30">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" /> {note.format}
        </span>
        <span className="absolute top-3 right-3">
          <ProductStatusBadge status={note.status} lang={lang} />
        </span>
        <p className="line-clamp-1 text-sm font-medium text-brand-100">{tr(note.subject, lang)}</p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold leading-snug text-ink-900">
          <Link href={href} className="hover:text-brand-700">
            {tr(note.title, lang)}
          </Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{tr(note.shortDescription, lang)}</p>
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
          <div className="flex items-center gap-1">
            <dt className="sr-only">{tr(n.pages, lang)}</dt>
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            <dd>{note.pages ? `${note.pages} ${tr(n.pages, lang)}` : `${tr(n.pages, lang)}: ${tr(n.tba, lang)}`}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">{tr(n.language, lang)}</dt>
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            <dd>{note.languages.map(langLabel).join(" / ")}</dd>
          </div>
        </dl>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <PriceBadge price={note.price} lang={lang} />
          {available ? (
            <Link href={`${href}#buy`} className="btn-primary">
              {tr(n.buyNow, lang)}
            </Link>
          ) : (
            <Link href={href} className="btn-outline">
              {tr(n.viewDetails, lang)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
