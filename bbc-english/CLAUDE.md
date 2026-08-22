# BBC English Coaching Classes Burhar — Platform

Persistent project instructions for this subfolder (`/bbc-english/`). Read this before making changes here; don't re-derive it from scratch each session.

## Purpose
A mobile-first, production-quality English-learning platform for **BBC English Coaching Classes Burhar** (Burhar, Madhya Pradesh, India). Independent institute — no BBC (British Broadcasting Corporation) affiliation, branding, or content. Positioning: "Practical English. Confident Speaking. Daily Practice." Tagline: "Don't Just Learn English. Use It."

This lives in a subfolder of a repo (`Mock-test`) that also hosts unrelated apps (root `index.html` mock-test, `ludo-3d/`). Never touch files outside `/bbc-english/` for this project.

## Tech stack
- Plain HTML5 + CSS3 + vanilla JS. No build step, no framework, no bundler.
- GitHub Pages compatible as a static subfolder site. All internal links are relative (no leading `/`) so it works whether served from repo root or a subpath.
- No external runtime dependencies unless they add clear value (currently: none). System font stack only — no Google Fonts — so the app works fully offline as a PWA.

## Directory structure
```
bbc-english/
  index.html, learn.html, dashboard.html, speaking.html, grammar.html,
  vocabulary.html, listening.html, reading.html, progress.html, courses.html,
  about.html, contact.html, privacy.html, test.html, onboarding.html,
  dictionary.html, writing-tools.html
  css/  style.css (design system + layout) · responsive.css (breakpoints) · components.css (reusable UI components)
  js/   app.js (shell: nav, theme, header stats) · config.js (SITE_CONFIG) · storage.js (localStorage wrapper)
        progress.js (progress/state helpers) · gamification.js (XP/levels/streak/achievements)
        quiz.js (quiz engine + scoring) · speaking.js (timer/recording)
  data/ vocabulary.js · grammar.js · speaking.js · reading.js · challenges.js · phrases.js · listening.js
        dictionary.js (EN-HI word list, `window.DICTIONARY`) · writing.js (notice/letter/paragraph/speech
        content for Student Writing Tools, `window.NOTICE_EXAMPLES`/`LETTER_EXAMPLES`/`PARAGRAPH_EXAMPLES`/`SPEECH_EXAMPLES`)
  assets/icons/  PWA icons (SVG-based, no binary asset pipeline)
  manifest.json, service-worker.js, robots.txt, sitemap.xml
```

## Coding conventions
- No comments unless explaining a genuinely non-obvious WHY.
- Data (vocabulary, grammar questions, prompts, passages, phrases) lives ONLY in `data/*.js` as plain arrays/objects assigned to `window.*`. Never inline large content lists into page HTML or into `js/*.js` UI logic.
- Every data file exposes a global namespace, e.g. `window.VOCABULARY`, `window.GRAMMAR_QUESTIONS`, `window.SPEAKING_PROMPTS`, `window.READING_PASSAGES`, `window.DAILY_CHALLENGES`, `window.PHRASES`. Scripts load in order: config → storage → progress → gamification → data/*.js → page script → app.js (app.js last so header reflects loaded state).
- Shared page shell (header/nav/footer) is duplicated per page (no templating available) but must stay structurally identical — copy from `index.html` when adding a page and update the active-nav class + `<title>`/meta only.
- Use semantic HTML, label every input, keep tab order logical, respect `prefers-reduced-motion`.

## Brand rules — never do this
- No BBC (British Broadcasting Corporation) logos, names implying affiliation, or copyrighted BBC content (audio/video/text).
- Never fabricate: phone numbers, addresses, student counts, awards, rankings, testimonials, results, pricing. All contact/business fields live in `js/config.js` (`SITE_CONFIG`) as empty strings until the owner supplies them — UI must hide/disable the related element gracefully when a field is empty (e.g. no WhatsApp button if `whatsapp` is blank).
- Never claim AI pronunciation/speech analysis — Speaking Lab is record/playback/self-evaluation only, no real analysis is implemented.
- The Free English Test is explicitly labelled a "learning snapshot," never an official/standardized assessment.
- Testimonials ship as `PLACEHOLDER — REPLACE WITH VERIFIED STUDENT TESTIMONIAL` until real ones are supplied.
- No fake payment flow. Course pricing fields exist in config as placeholders only; no checkout UI.

## Design system
- Palette (light): `--bg:#F7F6F2; --surface:#FFFFFF; --text:#1B2430; --text-muted:#5B6470; --primary:#1E3A5F; --primary-dark:#132842; --accent:#D97706; --success:#16A34A; --danger:#DC2626; --border:#E4E1D9`.
- Palette (dark): `--bg:#0E1620; --surface:#16202C; --text:#E8ECF1; --text-muted:#93A1B0; --primary:#6FA0D6; --primary-dark:#4C7BAE; --accent:#F5B441; --border:#243141`.
- Toggle via `data-theme="dark"` on `<html>`, persisted in `localStorage` (see `app.js`). Respect OS preference on first visit only.
- Rounded cards (14px), buttons/inputs (10px), subtle shadows only, no gradients, no childish illustration style. Strong type hierarchy, generous whitespace.
- Mobile bottom nav: Home / Learn / Speak / Progress / More. Desktop: top nav bar. Both defined once in `components.css`.

## Deployment
- Static site — no build. GitHub Pages serves this folder directly (or the whole repo, with links relative so the subfolder works either way).
- `manifest.json` + `service-worker.js` register from this folder's scope; update `CACHE_VERSION` in `service-worker.js` whenever cached files change, so old caches bust.

## Testing rules
- Before marking a phase done: open every new page, check the browser console for errors, confirm mobile nav + desktop nav both render, confirm dark mode toggle works, confirm localStorage read/write doesn't throw when storage is unavailable (private browsing).
- No dead ends: every page ends with a clear next-action CTA per the product spec's conversion funnel.

## Token-efficient workflow (for future Claude Code sessions)
- Don't re-read the whole project each session — use `@bbc-english/js/config.js` style direct references for known files.
- Keep large content additions inside `data/*.js`; never dump full data files into chat when only a few entries changed — use targeted Edits.
- Report phase completion concisely (completed / files changed / known issues / next phase) rather than pasting full file contents.
