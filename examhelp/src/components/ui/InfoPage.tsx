import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PageHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import type { Lang } from "@/types";

/** Shared shell for About / legal / policy pages. */
export function InfoPage({ lang, title, path, updated, children }: { lang: Lang; title: string; path: string; updated?: string; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title}>
        <Breadcrumbs items={[{ label: tr(dict.nav.home, lang), href: "/" }, { label: title, href: path }]} />
      </PageHeader>
      <div className="container-page py-10">
        <article className="prose-page">
          {updated && <p className="text-sm text-ink-500">{updated}</p>}
          {children}
        </article>
      </div>
    </>
  );
}
