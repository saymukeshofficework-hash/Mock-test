# Exam Hub / TETTESTHUB exam help (tettesthub.in/examhelp/) — notes for Claude

Owner: Mukesh Dahiya. Reply in short, plain language (Hindi or English as the user writes).
Make the smallest change that does the job. Touch only the files named in the request.

## Working rules (save tokens)
- Do not explore the whole repo. Use the map below, then open only the needed files.
- One task per chat. No sub-agents, no screenshots or browser testing unless asked.
- Check quickly with `npx tsc --noEmit` or `npm run lint` on changed files only. A full `next build` only before a deploy-risky change (routing, config, data shape).
- Do not wait for the deploy. Give the live URL and let the user check.
- Final reply: 3 lines max (what changed, which file, live URL).
- All user-facing text is bilingual (Hindi + English). Hindi uses Noto Sans Devanagari.
- Never commit secrets (`.env.local`, Razorpay or Supabase service keys). Paid content (notes, test answers, current affairs) stays in Supabase, never in public files or this repo.
- Block checkout whenever the Razorpay key starts with `rzp_test_` unless `ALLOW_TEST_PAYMENTS` is explicitly set.

## How this site reaches the public
- This folder is the **Next.js 15 (App Router, TypeScript, Tailwind 4)** app, now inside the `Mock-test` repo as `examhelp/`. Work on a branch and merge to `main`.
- The live site `tettesthub.in/examhelp/` is built by `Mock-test/.github/workflows/deploy.yml`: static export with `NEXT_PUBLIC_STATIC_EXPORT=1`, `NEXT_PUBLIC_BASE_PATH=/examhelp`. It runs on each push to `main` and daily at 00:15 IST.
- Static export cannot run `src/app/api`. The build deletes it, so server logic lives in Supabase Edge Functions, not Next API routes.
- Old repo `Chat-practice-121` (branch `feat/exam-hub-phase-1-3`) is a backup only.

## Map
- `src/app/` — pages: `exams/[slug]`, `exam-calendar`, `notes`, `test-series`, `current-affairs`, `practice`, `search`, `results`, `admit-card`, `previous-papers`, `notifications`, `download`, `contact`, `faq`, `about`, policies, and `admin/`.
- Product landing pages: `mp-high-court-assistant-grade-3-notes`, `...-test-series`, `...-mock-tests`, `mp-police-constable-gd-mock-tests`, `mp-police-subedar-asi-mock-tests`.
- `src/components/` — grouped by area: `ca` (current affairs UI), `notes`, `mock`, `exam`, `admin`, `landing`, `home`, `layout`, `ui`, `brand`, `search`, `contact`, `download`.
- `src/data/` — typed data: `exams.ts` (exam dates, mark tentative vs confirmed), `mockTests.ts`, `notes.ts`, `faqs.ts`, `categories.ts`, `notifications.ts`.
- `src/lib/` — `site.ts` (site config), `payments.ts`, `checkout.ts`, `seo.ts`, `dates.ts`, `search.ts`, `validation.ts`, `nav.ts`.
- `src/i18n/` — Hindi/English strings.
- `public/mock-tests/{ag3,asi,pcgd}` — free sample tests (only one free test per series). `public/samples` — sample PDFs. `public/practice-paper-generator/index.html` — encrypted Practice Paper Generator (login-protected; do not print or store its password in repo files).
- `supabase/functions/` — `notes-checkout`, `razorpay-webhook`, `testhub-admin` (deploy with verify_jwt false; the public site calls them with the anon key). `supabase/migrations/` — SQL.
- `.env.example` — names of environment variables only.

## Supabase
- Project `exam-hub`, ref `znulepzdihzhjmuvyroi`. Tables include orders (status: created/paid/failed/cancelled), notes and tests access, and `ca_days` (daily current affairs, paid ₹49/month; filled each night by a scheduled job, not by hand).
- Row Level Security protects data. Do not rely on hidden buttons.

## Business rules (set by the owner)
- Exactly one free test per series. Series are 25 tests each.
- Products: PDF notes ₹299 (MP High Court Assistant Grade-3), test series ₹199, daily current affairs ₹49/month.
- Exam dates: verify against official MPESB / MPPSC pages. Never trust third-party aggregators. Mark tentative vs confirmed.
- Homepage at tettesthub.in is a login-gated page; `/examhelp/` shows the same catalogue landing page.
