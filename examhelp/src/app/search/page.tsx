import type { Metadata } from "next";
import { SearchResults } from "@/components/search/SearchResults";
import { PageHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
  alternates: { canonical: "/search" },
};

export default async function SearchPage() {
  const lang = await getLang();
  return (
    <>
      <PageHeader title={tr(dict.nav.search, lang)} />
      <div className="container-page py-8">
        <SearchResults lang={lang} />
      </div>
    </>
  );
}
