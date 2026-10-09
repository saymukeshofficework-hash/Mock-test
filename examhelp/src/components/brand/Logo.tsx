/** TETTESTHUB mark: an open book forming a target, with a check mark. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="10" fill="var(--brand-700)" />
      <path d="M8 13.5c4.2-1.4 8.2-.9 12 1.6v15c-3.8-2.5-7.8-3-12-1.6v-15Z" fill="#fff" opacity=".95" />
      <path d="M32 13.5c-4.2-1.4-8.2-.9-12 1.6v15c3.8-2.5 7.8-3 12-1.6v-15Z" fill="#fff" opacity=".78" />
      <circle cx="29.5" cy="11" r="6.5" fill="var(--accent-500)" stroke="var(--brand-700)" strokeWidth="2" />
      <path d="m26.8 11.1 1.9 1.9 3.6-3.8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}>
        TETTEST<span className="text-accent-500">HUB</span>
      </span>
    </span>
  );
}
