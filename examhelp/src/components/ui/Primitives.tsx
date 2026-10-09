import Link from "next/link";
import { ArrowRight, ExternalLink, Inbox } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel,
  id,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-2xl font-bold text-brand-900 sm:text-3xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-ink-500">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-ink-200 bg-gradient-to-b from-brand-50 to-canvas">
      <div className="container-page py-8 sm:py-12">
        {children}
        <h1 className="mt-2 text-3xl font-extrabold text-brand-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-ink-700">{subtitle}</p>}
      </div>
    </div>
  );
}

/** External link to an official site. Always opens safely in a new tab. */
export function ExternalButton({
  href,
  children,
  variant = "outline",
  srHint,
}: {
  href: string;
  children: ReactNode;
  variant?: "outline" | "navy" | "primary";
  srHint?: string;
}) {
  const cls = variant === "navy" ? "btn-navy" : variant === "primary" ? "btn-primary" : "btn-outline";
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      {srHint && <span className="sr-only">{srHint}</span>}
    </a>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
        <Inbox className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-lg font-semibold text-ink-900">{title}</p>
      {hint && <p className="mt-1 max-w-md text-ink-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; escape "<" to prevent breaking out of the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
