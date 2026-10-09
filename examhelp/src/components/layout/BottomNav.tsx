"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, Home, LayoutGrid, NotebookPen } from "lucide-react";
import { dict, tr } from "@/i18n/dictionary";
import { isActive } from "@/lib/nav";
import type { Lang } from "@/types";

/** Mobile bottom navigation (spec §35). The "Menu" tab opens the sitemap-style menu page. */
export function BottomNav({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: dict.nav.home, Icon: Home },
    { href: "/exams", label: dict.nav.exams, Icon: ClipboardList },
    { href: "/notes", label: dict.nav.notes, Icon: BookOpen },
    { href: "/test-series", label: dict.nav.tests, Icon: NotebookPen },
    { href: "/menu", label: dict.nav.menu, Icon: LayoutGrid },
  ];
  return (
    <nav
      aria-label="Bottom"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                  active ? "text-brand-700" : "text-ink-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} aria-hidden="true" />
                {tr(label, lang)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
