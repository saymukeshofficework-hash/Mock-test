import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { site } from "@/lib/site";
import { JsonLd } from "./Primitives";

export interface Crumb {
  label: string;
  href: string;
}

/** Visible breadcrumbs plus BreadcrumbList schema. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${site.url}${c.href}`,
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-ink-500">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.href} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className="truncate font-medium text-ink-700">
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-brand-600">
                  {c.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd data={schema} />
    </nav>
  );
}
