import { siteConfig } from '../config/site';

/** Prefix an internal path with the configured base path (import.meta.env.BASE_URL). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/**
 * Absolute URL for canonical tags, Open Graph, RSS, sitemap, structured data.
 * Deliberately plain string concatenation, NOT `new URL(path, base)` — that
 * constructor treats any leading-slash path as root-relative to base's
 * *origin*, silently dropping BLOG_DOMAIN's own path portion (e.g. the
 * "/Mock-test" in "https://user.github.io/Mock-test").
 */
export function absoluteUrl(path: string): string {
  const domain = siteConfig.BLOG_DOMAIN.replace(/\/$/, '');
  return `${domain}${withBase(path)}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
