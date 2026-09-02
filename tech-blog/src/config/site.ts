/**
 * CENTRAL BRAND CONFIGURATION
 * ---------------------------
 * Every placeholder value below is used throughout the site. Change a
 * value here once and it updates everywhere — no other file should ever
 * hard-code the blog name, colors, author, domain, or IDs.
 *
 * Values in ALL_CAPS-looking strings (e.g. "BLOG_NAME") are literal
 * placeholders — replace them with real values before launch. Nothing
 * here is invented; empty/placeholder values are left empty on purpose.
 */

export const siteConfig = {
  BLOG_NAME: 'BLOG_NAME',
  BLOG_TAGLINE: 'BLOG_TAGLINE',
  BLOG_DESCRIPTION:
    'BLOG_DESCRIPTION — replace with a real 150-160 character site description before launch.',

  // The site ROOT only — do not include "/tech-blog" here, astro.config.mjs's
  // `base: '/tech-blog'` adds that automatically to every URL this site
  // generates (canonical, sitemap, RSS, Open Graph). Swap this for the real
  // custom domain root (e.g. "https://example.com") when one is attached,
  // and change `base` to '/' at the same time — see docs/CUSTOM_DOMAIN.md.
  BLOG_DOMAIN: 'https://REPLACE-WITH-GITHUB-USERNAME.github.io/Mock-test',

  AUTHOR_NAME: 'AUTHOR_NAME',
  AUTHOR_BIO: 'AUTHOR_BIO — add a real author bio before launch.',
  AUTHOR_PHOTO: '', // e.g. '/images/author.jpg' — left empty until a real photo is supplied
  CONTACT_EMAIL: 'CONTACT_EMAIL',

  LOGO: '/images/logo-placeholder.svg',
  FAVICON: '/favicon.svg',

  // Any valid CSS color. Used by src/styles/global.css via inline custom
  // properties. Swiss-Modernism-inspired editorial palette (via the
  // ui-ux-pro-max skill's design-system search for this product type):
  // near-black + charcoal structure, one confident accent color. Change
  // any of the three here and every button/link/badge/focus-ring follows —
  // ACCENT_COLOR's darker interactive shade (links, button fills) is
  // derived automatically in global.css via color-mix(), so this stays a
  // single value to edit, not two.
  PRIMARY_COLOR: '#18181B',
  SECONDARY_COLOR: '#3F3F46',
  ACCENT_COLOR: '#EC4899',

  SOCIAL_LINKS: {
    twitter: '',
    linkedin: '',
    facebook: '',
    youtube: '',
    instagram: '',
  },

  // Leave empty until real IDs are supplied. An empty value disables
  // the corresponding snippet — see src/layouts/BaseLayout.astro.
  GOOGLE_ANALYTICS_ID: '', // e.g. "G-XXXXXXXXXX"
  SEARCH_CONSOLE_VERIFICATION: '', // e.g. "abc123..." (the content= value only)
} as const;

export type SiteConfig = typeof siteConfig;
