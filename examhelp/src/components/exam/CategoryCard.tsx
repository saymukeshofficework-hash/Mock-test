import Link from "next/link";
import { Building2, FileText, GraduationCap, HeartPulse, Landmark, LayoutGrid, Scale, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import { tr } from "@/i18n/dictionary";
import type { ExamCategory, Lang } from "@/types";

const icons: Record<string, LucideIcon> = { Building2, FileText, GraduationCap, HeartPulse, Landmark, LayoutGrid, Scale, ShieldCheck, Wrench };

export function CategoryIcon({ name, className = "h-6 w-6" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? LayoutGrid;
  return <Icon className={className} aria-hidden="true" />;
}

export function CategoryCard({ category, lang, count }: { category: ExamCategory; lang: Lang; count?: number }) {
  return (
    <Link
      href={`/exams?category=${category.slug}`}
      className="card card-hover group flex items-start gap-4 p-5"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
        <CategoryIcon name={category.icon} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 font-bold text-ink-900">
          {tr(category.name, lang)}
          {typeof count === "number" && count > 0 && <span className="chip bg-accent-50 text-accent-700">{count}</span>}
        </span>
        <span className="mt-0.5 block text-sm text-ink-500">{tr(category.description, lang)}</span>
      </span>
    </Link>
  );
}
