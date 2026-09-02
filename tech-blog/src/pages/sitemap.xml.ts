import type { APIRoute } from 'astro';
import { getAllPosts } from '../lib/posts';
import { categories } from '../config/categories';
import { absoluteUrl } from '../lib/url';

const STATIC_PATHS = [
  '/',
  '/about/',
  '/contact/',
  '/privacy-policy/',
  '/terms/',
  '/disclaimer/',
  '/affiliate-disclosure/',
  '/category/',
];

export const GET: APIRoute = async () => {
  const posts = await getAllPosts();
  const usedCategorySlugs = new Set(
    categories.filter((c) => posts.some((p) => p.data.category === c.name)).map((c) => c.slug)
  );

  const urls: { loc: string; lastmod?: string }[] = [
    ...STATIC_PATHS.map((path) => ({ loc: absoluteUrl(path) })),
    ...Array.from(usedCategorySlugs).map((slug) => ({ loc: absoluteUrl(`/category/${slug}/`) })),
    ...posts.map((post) => ({
      loc: absoluteUrl(`/posts/${post.slug}/`),
      lastmod: (post.data.updated ?? post.data.date).toISOString(),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
