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
    { href: "https://tettesthub.in/index.html", label: dict.nav.home, Icon: Home, abs: true },
    { href: "/test-series", label: dict.nav.tests, Icon: NotebookPen },
    // exam list lives on the static courses catalogue, outside the Next.js app
    { href: "/examhelp/courses/#courses", label: dict.nav.exams, Icon: ClipboardList, abs: true },
    { href: "/exam-calendar", label: dict.nav.calendar, Icon: CalendarDays },
    { href: "/contact", label: dict.nav.contact, Icon: Phone },
  ];
  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, Icon, abs }) => {
          const active = !abs && isActive(pathname, href);
          const cls = `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
            active ? "text-brand-700" : "text-ink-500"
          }`;
          const content = (
            <>
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} aria-hidden="true" />
              {label === dict.nav.home ? "Home" : label === dict.nav.tests ? "My Test" : label === dict.nav.contact ? "Contact" : tr(label, lang)}
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
