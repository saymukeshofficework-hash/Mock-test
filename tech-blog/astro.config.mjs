import { defineConfig } from 'astro/config';
import { siteConfig } from './src/config/site.ts';

// Deployed today as a sub-path project on GitHub Pages, alongside this
// repo's other independent sites (see the shared .github/workflows/deploy.yml).
// When a custom domain (BLOG_DOMAIN in src/config/site.ts) is attached,
// change `base` to '/' and re-deploy — see docs/CUSTOM_DOMAIN.md.
const BASE_PATH = '/tech-blog';

export default defineConfig({
  site: siteConfig.BLOG_DOMAIN,
  base: BASE_PATH,
  trailingSlash: 'always',
  // No @astrojs/sitemap integration — it hit a build-hook incompatibility
  // with this Astro version (`_routes` undefined). src/pages/sitemap.xml.ts
  // hand-writes the same output; simpler and one less dependency anyway.
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
