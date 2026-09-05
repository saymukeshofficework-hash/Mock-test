# Mock-test

## TET Test Hub

The site root is **TET Test Hub** — a manual-payment, login-gated TET (Teacher
Eligibility Test) mock test platform: a marketing homepage (`index.html`), a test
catalogue (`tests.html`), student login/dashboard (`login.html` / `dashboard.html`),
and 20 exam pages (`tet-mock-test-1.html` … `tet-mock-test-20.html`) — each a
150-question, 5-section, bilingual (English/Hindi) exam with a timer, question palette
and results screen, sharing one engine (`assets/tet-engine.css` / `assets/tet-engine.js`).

Payment is 100% manual (Razorpay Payment Links, verified by hand in the Razorpay
Dashboard) and accounts are created by hand in Supabase — there is no backend server
and no payment API integration. Test questions are stored in Supabase (Postgres +
Row Level Security), not as public files, so only a logged-in student with that test
in their `purchased_tests` can fetch its questions — enforced by the database, not by
hiding buttons. See [`ADMIN_INSTRUCTIONS.md`](./ADMIN_INSTRUCTIONS.md) for the full
setup and day-to-day workflow, and [`SECURITY.md`](./SECURITY.md) for exactly what is
and isn't protected.

- `js/site-config.js` — single source of truth for prices, Razorpay Payment Links,
  Supabase connection details, contact info, and the 20-test catalogue.
- `js/auth.js` — shared Supabase Auth helpers (login, logout, session/profile checks).
- `scripts/question-bank.js` / `scripts/lib/build-sections.js` — the question pool.
- [`scripts/export-supabase-seed.js`](./scripts/export-supabase-seed.js) — generates
  `supabase/seed_tests.sql` (paste into the Supabase SQL Editor) from the bank.
- [`scripts/generate-tests.js`](./scripts/generate-tests.js) — generates the 20
  `tet-mock-test-N.html` shells from `scripts/test-page.template.html`.

To publish test 21+: extend `scripts/question-bank.js`, bump `TOTAL_TESTS` in both
generator scripts, add a row to `TEST_CATALOG`/`PAYMENT_LINKS` in `js/site-config.js`,
re-run both scripts, and paste the new SQL into Supabase.

## BBC English Coaching Classes Burhar

This repository also contains a mobile-first English learning platform for **BBC English Coaching Classes Burhar** (an independent coaching institute in Burhar, Madhya Pradesh — not affiliated with the British Broadcasting Corporation). It's a static HTML/CSS/JS site with no build step — open [`bbc-english/index.html`](./bbc-english/index.html) directly, or serve the `bbc-english/` folder with any static file server. See [`bbc-english/CLAUDE.md`](./bbc-english/CLAUDE.md) for architecture and conventions.

## Ludo 3D

This repository also contains **Ludo 3D**, a complete 3D multiplayer Ludo game built with Three.js and Vite. See [`ludo-3d/README.md`](./ludo-3d/README.md) for features, local development, and GitHub Pages deployment instructions.

## 80-Second Video Maker

This repository also contains the **80-Second Video Maker**, a browser-based video cutter and music mixer that automatically splits an uploaded video into 80-second clips and mixes in your own MP3 music — processed entirely on-device via ffmpeg.wasm, with no backend and no uploads. It's a static site with no build step — open [`video-cutter/index.html`](./video-cutter/index.html) via a local static server, or see [`video-cutter/README.md`](./video-cutter/README.md) for details.

## Primary Teacher

This repository also contains **Primary Teacher**, a hands-free, voice-led digital
classroom app for primary-school children learning in a group: the teacher presses
Start once and the app speaks each item (counting, alphabet, matras, words), waits
for the children's chorus, pauses, and moves on — all via the browser's built-in
Web Speech API, with no backend, database, or API keys. It's a static site with no
build step — open [`primary-teacher/index.html`](./primary-teacher/index.html)
directly, or serve the `primary-teacher/` folder with any static file server. See
[`primary-teacher/README.md`](./primary-teacher/README.md) for details on adding
lessons and Hindi voice setup.

## Bulbul Bhatia

This repository also contains **Bulbul Bhatia**, a premium bilingual (English/Hindi) website for a Tarot reader, astrologer and online Tarot & Astrology teacher — consultations, courses, free astrology tools and horoscope. Built with React, TypeScript, Tailwind CSS and Vite. See [`bulbul-bhatia/README.md`](./bulbul-bhatia/README.md) for development and deployment details.

## Mukesh Dahiya

This repository also contains a premium educational platform for **Mukesh Dahiya** (M.Sc. Botany, M.A. English, 12 years teaching experience) — study notes, solutions, questions, previous papers, premium courses, paid notes, online classes, NEET Biology resources and educational calculators for Classes 5–12, CBSE & MP Board, English Medium. Built with React, TypeScript, Tailwind CSS and Vite on a fully data-driven architecture — new content (notes, questions, courses, etc.) is added via the files under `mukesh-singh-dahiya/src/data/` without touching page code. See [`mukesh-singh-dahiya/README.md`](./mukesh-singh-dahiya/README.md) for development details.

## Technology Blog

This repository also contains a **technology blog** (brand name not finalized — see placeholders in `tech-blog/src/config/site.ts`) covering AI tools, software, automation, productivity, smartphones, gadgets, electronics, and buying guides. Built with Astro as a static, content-first site: articles are Markdown files with validated front matter (`tech-blog/src/content/posts/`), and publishing one is the entire workflow — push a Markdown file, GitHub Actions builds and deploys it, no code changes needed. See [`tech-blog/README.md`](./tech-blog/README.md) and [`tech-blog/docs/SPARK_PUBLISHING_GUIDE.md`](./tech-blog/docs/SPARK_PUBLISHING_GUIDE.md) for details.

