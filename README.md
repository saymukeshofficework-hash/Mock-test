# Mock-test

## TET Mock Tests

The site root ([`index.html`](./index.html)) is the **TET Mock Tests** home page — it lists all 20 TET (Teacher Eligibility Test) mock tests as cards with a question count and a "Start Test" button. Each test (`tet-mock-test-1.html` … `tet-mock-test-20.html`) is a 150-question, 5-section, bilingual (English/Hindi) exam with a timer, question palette and results screen, all sharing one engine:

- [`assets/tet-engine.css`](./assets/tet-engine.css) and [`assets/tet-engine.js`](./assets/tet-engine.js) — the exam UI/logic, shared by every test page.
- `assets/data/test-N.js` — that test's 150 questions (`const sections = [...]`), loaded before the shared engine.
- `scripts/question-bank.js` — the underlying pool of questions per section (60 each), and [`scripts/generate-tests.js`](./scripts/generate-tests.js) — generates all 20 data files + HTML pages from that bank (a rotating 30-question window per test, so no test repeats a question within itself). Run `node scripts/generate-tests.js` after editing the bank to regenerate everything.

To publish test 21+: add questions to `scripts/question-bank.js`, bump `TOTAL_TESTS` in `scripts/generate-tests.js`, re-run it, and add one entry to the `tests` array in `index.html`.

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

## Mukesh Singh Dahiya

This repository also contains a premium educational platform for **Mukesh Singh Dahiya** (M.Sc. Botany, M.A. English, 12 years teaching experience) — study notes, solutions, questions, previous papers, premium courses, paid notes, online classes, NEET Biology resources and educational calculators for Classes 5–12, CBSE & MP Board, English Medium. Built with React, TypeScript, Tailwind CSS and Vite on a fully data-driven architecture — new content (notes, questions, courses, etc.) is added via the files under `mukesh-singh-dahiya/src/data/` without touching page code. See [`mukesh-singh-dahiya/README.md`](./mukesh-singh-dahiya/README.md) for development details.

