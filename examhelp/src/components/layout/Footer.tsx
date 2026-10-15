import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { dict, tr } from "@/i18n/dictionary";
import { site } from "@/lib/site";
import type { Lang } from "@/types";

export function Footer({ lang }: { lang: Lang }) {
  const n = dict.nav;
  const cols = [
    {
      title: "TETTESTHUB",
      links: [
        { href: "/exams", label: n.exams },
        { href: "/notes", label: n.notes },
        { href: "/test-series", label: n.testSeries },
        { href: "/practice", label: n.practice },
        { href: "/current-affairs", label: n.currentAffairs },
      ],
    },
    {
      title: tr(dict.footer.resources, lang),
      links: [
        { href: "/exam-calendar", label: n.calendar },
        { href: "/previous-papers", label: n.previousPapers },
        { href: "/results", label: n.results },
        { href: "/admit-card", label: n.admitCard },
        { href: "/notifications", label: n.notifications },
      ],
    },
    {
      title: tr(dict.footer.company, lang),
      links: [
        { href: "/about", label: n.about },
        { href: "/contact", label: n.contact },
        { href: "/privacy-policy", label: n.privacy },
        { href: "/terms", label: n.terms },
        { href: "/refund-policy", label: n.refund },
        { href: "/disclaimer", label: n.disclaimer },
      ],
    },
  ];

  return (
    <footer className="mt-16 bg-brand-950 pb-20 text-brand-100 xl:pb-0">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm text-brand-100/80">{tr(dict.footer.about, lang)}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-sm font-bold tracking-wide text-white uppercase">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-brand-100/80 hover:text-white">
                    {tr(l.label, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="text-sm font-bold tracking-wide text-white uppercase">{tr(dict.footer.official, lang)}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {site.officialSources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-100/80 hover:text-white">
                  {s.name}
                  <span className="sr-only"> {tr(dict.common.opensNewTab, lang)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-brand-100/70 sm:flex-row sm:items-center sm:justify-between">
          <p>{tr(dict.footer.rights, lang)}</p>
          <p>{tr(dict.disclaimer.affiliation, lang)}</p>
        </div>
      </div>
    </footer>
  );
}
