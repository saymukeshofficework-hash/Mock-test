import { ChevronDown } from "lucide-react";
import { tr } from "@/i18n/dictionary";
import type { Faq, Lang } from "@/types";
import { JsonLd } from "./Primitives";

/** Accessible accordion built on <details>, with FAQPage schema. */
export function FaqList({ faqs, lang, withSchema = true }: { faqs: Faq[]; lang: Lang; withSchema?: boolean }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: tr(f.question, lang),
      acceptedAnswer: { "@type": "Answer", text: tr(f.answer, lang) },
    })),
  };
  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <details key={f.id} className="group card open:shadow-[var(--shadow-lift)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
            {tr(f.question, lang)}
            <ChevronDown className="h-5 w-5 shrink-0 text-ink-500 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="px-5 pb-5 text-ink-700">{tr(f.answer, lang)}</p>
        </details>
      ))}
      {withSchema && <JsonLd data={schema} />}
    </div>
  );
}
