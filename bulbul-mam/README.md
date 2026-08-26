# Bulbul Mam

A premium, bilingual (English/Hindi) website for **Bulbul Mam** — Tarot reader, astrologer and online Tarot & Astrology teacher. Built with React, TypeScript, Tailwind CSS and Vite.

## What's here

- **Consultations** — Astrology and Tarot service listings (`/astrology-services`, `/tarot-services`) with a booking flow (`/book`).
- **Courses** — Tarot and Astrology courses across six learning levels (Beginner → Mastery), with a reusable course-detail page (`/courses/:slug`).
- **Free astrology tools** (`/tools`) — numerology calculators are genuinely computed client-side (deterministic digit-sum arithmetic); anything requiring real astronomical data (Kundli, Dasha, Panchang, Dosha, chart matching) presents a ready input form and is clearly labeled as awaiting a calculation engine rather than faking a result. See `src/lib/calculationEngine.ts`.
- **Horoscope** (`/horoscope`) — all 12 zodiac signs with general daily/weekly/monthly/yearly guidance, clearly labeled as general guidance rather than a personalized prediction.
- Bilingual throughout via `src/i18n` (centralized translation dictionary, no duplicated pages) and per-item bilingual fields in `src/data`.

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and production build to dist/
npm run preview   # preview the production build
```

## Content & configuration

- `src/data/contact.ts` — phone/email/WhatsApp/social links. Currently placeholders; update before launch.
- `src/data/testimonials.ts` — explicitly flagged placeholder testimonials. Replace with real, consented quotes before publishing.
- `src/data/courses.ts` — course duration/price/certificate are left blank (`—`) where not supplied; never invented.
- Images live in `public/images/{zodiac,tarot,astrology,cosmic,decorative}`. No real photographs of Bulbul Mam were available at build time, so the site uses a monogram/decorative placeholder for her portrait instead of a stock photo — swap in real photography under `public/images/bulbul-mam/` when available.

## Deployment note

This app is one of several projects hosted on the same combined GitHub Pages site (see the repo root `.github/workflows/deploy.yml`) and is mounted under `/bulbul-mam/`. Because of that:

- `vite.config.ts` uses a relative `base: './'`.
- The router's `basename` and all `public/` asset URLs are resolved at runtime against the current `/bulbul-mam` path segment (`src/lib/publicBase.ts`), not hard-coded, so the app works regardless of the exact owner/repo prefix in front of it.
- The repo-root `404.html` redirects a direct/refreshed load of a deep route (e.g. `/bulbul-mam/tools/kundli-calculator`) back to this app's `index.html` with the real path encoded in a query string; `src/main.tsx` decodes it and restores the URL before the router reads it — the standard SPA-on-GitHub-Pages pattern.
