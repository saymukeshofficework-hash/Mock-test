import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PageHeader } from "@/components/ui/Primitives";
import { dict, tr } from "@/i18n/dictionary";
import { getLang } from "@/i18n/server";
import { mobileNav, moreNav } from "@/lib/nav";

export const metadata: Metadata = { title: "Menu", robots: { index: false, follow: true }, alternates: { canonical: "/menu" } };

/** Target of the "Menu" tab in the mobile bottom navigation. */
export default async function MenuPage() {
  const lang = await getLang();
  const links = [...mobileNav.slice(1), ...moreNav.slice(2)];
  return (
    <>
      <PageHeader title={tr(dict.nav.menu, lang)}>
        <LanguageSwitcher lang={lang} />
      </PageHeader>
      <div className="container-page max-w-2xl py-6">
        <ul className="card divide-y divide-ink-100">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex min-h-13 items-center justify-between px-5 py-3.5 font-medium text-ink-900 hover:bg-brand-50">
                {tr(l.label, lang)}
                <ChevronRight className="h-4 w-4 text-ink-500" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
