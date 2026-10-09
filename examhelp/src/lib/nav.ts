import { dict } from "@/i18n/dictionary";
import type { Bilingual } from "@/types";

export interface NavItem {
  href: string;
  label: Bilingual;
}

const n = dict.nav;

/** Desktop primary navigation (spec §5). */
export const primaryNav: NavItem[] = [
  { href: "/", label: n.home },
  { href: "/exams", label: n.exams },
  { href: "/exam-calendar", label: n.calendar },
  { href: "/notes", label: n.notes },
  { href: "/test-series", label: n.testSeries },
  { href: "/practice", label: n.practice },
  { href: "/current-affairs", label: n.currentAffairs },
  { href: "/previous-papers", label: n.previousPapers },
  { href: "/results", label: n.results },
  { href: "/admit-card", label: n.admitCard },
  { href: "/notifications", label: n.notifications },
];

export const moreNav: NavItem[] = [
  { href: "/about", label: n.about },
  { href: "/contact", label: n.contact },
  { href: "/privacy-policy", label: n.privacy },
  { href: "/disclaimer", label: n.disclaimer },
  { href: "/terms", label: n.terms },
  { href: "/refund-policy", label: n.refund },
  { href: "/faq", label: n.faq },
];

/** Mobile drawer (spec §6). */
export const mobileNav: NavItem[] = [
  { href: "/", label: n.home },
  { href: "/exams", label: n.upcomingExams },
  { href: "/exam-calendar", label: n.calendar },
  { href: "/notes", label: n.notes },
  { href: "/test-series", label: n.testSeries },
  { href: "/practice", label: n.practice },
  { href: "/current-affairs", label: n.currentAffairs },
  { href: "/previous-papers", label: n.previousPapers },
  { href: "/results", label: n.results },
  { href: "/admit-card", label: n.admitCard },
  { href: "/notifications", label: n.notifications },
  { href: "/exams#categories", label: n.categories },
  { href: "/about", label: n.about },
  { href: "/contact", label: n.contact },
];

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
