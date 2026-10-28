"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, NotebookPen, LayoutGrid, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { dict, tr } from "@/i18n/dictionary";
import { isActive } from "@/lib/nav";
import type { Lang } from "@/types";
import { isDesktopExamHeaderPage } from "./DesktopExamHeader";

/** Shared fixed navigation for all app pages and screen sizes. Labels intentionally stay English. */
export function BottomNav({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const router = useRouter();
  // 25-test series pages carry these options in their one-line desktop header.
  const desktopHidden = isDesktopExamHeaderPage(pathname) ? "lg:hidden" : "";
  const logout = () => {
    try {
      Object.keys(localStorage).filter((key) => key.includes("auth-token") || key.startsWith("sb-")).forEach((key) => localStorage.removeItem(key));
      sessionStorage.clear();
    } catch { /* ignore unavailable storage */ }
    window.location.href = "https://tettesthub.in/login.html";
  };
  const items = [
    { href: "https://tettesthub.in/index.html", label: dict.nav.home, fixedLabel: "Home", Icon: Home, abs: true, color: "text-blue-600" },
    { href: "https://tettesthub.in/course-folders.html", label: dict.nav.tests, fixedLabel: "Courses", Icon: LayoutGrid, abs: true, color: "text-violet-600" },
    { href: "https://tettesthub.in/dashboard.html", label: dict.nav.tests, fixedLabel: "My Test", Icon: NotebookPen, abs: true, color: "text-sky-600" },
  ];
  return (
    <nav
      aria-label="Bottom navigation"
      data-tth-no-translate="true"
      className={`fixed inset-x-0 bottom-0 z-[1000] border-t border-ink-200 bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(15,23,42,0.12)] backdrop-blur xl:inset-x-auto xl:left-1/2 xl:top-[76px] xl:bottom-auto xl:w-[720px] xl:-translate-x-1/2 xl:rounded-b-2xl xl:rounded-t-none xl:border-x xl:border-b xl:border-t-0 xl:pb-0 ${desktopHidden}`}
    >
      <ul className="mx-auto grid max-w-none grid-cols-4">
        {items.map(({ href, label, fixedLabel, Icon, abs, color }) => {
          const active = !abs && isActive(pathname, href);
          const cls = `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold xl:min-h-12 xl:flex-row xl:gap-2 xl:text-sm ${
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
        <li>
          <button type="button" onClick={logout} className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-bold text-orange-600 xl:min-h-12 xl:flex-row xl:gap-2 xl:text-sm">
            <LogOut className="h-5 w-5 stroke-[2.75]" aria-hidden="true" />
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
