"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardList, Home, NotebookPen, Phone } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { isActive } from "@/lib/nav";
import type { Lang } from "@/types";

/** Shared fixed mobile navigation for all app pages. */
export function BottomNav({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const items = [
    { href: "https://tettesthub.in/index.html", label: dict.nav.home, fixedLabel: "Home", Icon: Home, abs: true, color: "text-blue-600" },
    { href: "/test-series", label: dict.nav.tests, fixedLabel: "My Test", Icon: NotebookPen, color: "text-emerald-600" },
    { href: "/contact", label: dict.nav.contact, fixedLabel: "Contact", Icon: Phone, color: "text-rose-600" },
  ];
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {items.map(({ href, label, fixedLabel, Icon, abs, color }) => {
          const active = !abs && isActive(pathname, href);
          const cls = `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
            active ? "text-brand-800" : color
          }`;
          const content = (
            <>
              <Icon className={`h-5 w-5 stroke-[2.75] ${active ? "scale-110" : ""}`} aria-hidden="true" />
              {fixedLabel ?? tr(label, lang)}
            </>
          );
          return (
            <li key={href}>
              {abs ? (
                <a href={href} className={cls}>{content}</a>
              ) : (
                <Link href={href} aria-current={active ? "page" : undefined} className={cls}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
