import type { APIRoute } from 'astro';
import { absoluteUrl } from '../lib/url';

// Generated (not a static public/ file) so the Sitemap: line always
// reflects the current BLOG_DOMAIN/base without going stale.
export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
