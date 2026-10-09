# TETTESTHUB (tettesthub.in) — notes for Claude

Owner: Mukesh Dahiya. Reply in short, plain language (Hindi or English as the user writes).
Make the smallest change that does the job. Touch only the files named in the request.

## Working rules (save tokens)
- Do not explore the whole repo. Use the map below, then open only the needed files.
- One task per chat. No sub-agents, no screenshots or browser testing unless asked.
- Run a quick syntax check only (`node --check`, or extract inline script and check). Do not wait for the deploy; give the live URL and let the user check.
- Final reply: 3 lines max (what changed, which file, live URL).
- Never write paid content (notes, test answers, current affairs) into public files. It stays in Supabase.
- Never put passwords, API keys or the Razorpay secret in the repo. Block sales if a Razorpay key starts with `rzp_test_`.
- All user-facing text is bilingual (Hindi + English).

## Deploy
- Host: GitHub Pages, custom domain via `CNAME` = tettesthub.in.
- Push to `main` runs `.github/workflows/deploy.yml` (about 2–4 min). It builds the sub-apps and copies them into `_site`.
- Add `[skip ci]` to a commit message to skip the deploy (docs-only changes).
- New static folder: add a `cp -r <folder> _site/<folder>` line in the "Assemble combined site" step of the workflow, and add the page to `sitemap.xml`.
- Check deploy: `gh run list -R saymukeshofficework-hash/Mock-test -L 1`.

## Map
- `index.html`, `tests.html`, `login.html`, `dashboard.html`, `reset-password.html` — main site pages.
- `tet-mock-test-N.html` — generated from `scripts/test-page.template.html` by `scripts/generate-tests.js`. Edit the template, then regenerate. Do not hand-edit all N files.
- `assets/tet-engine.js|css` — shared exam engine. `js/site-config.js` — prices, links, Supabase URL, test catalogue. `js/auth.js` — login helpers.
- `home/` — catalogue landing page (also served as `/examhelp/` index).
- `bridge-course/` — NIOS Bridge Course notes store (own npm build; paid PDF must never appear in the bundle). `bridge-course/cover-page` — fillable cover page tool.
- `survey/` — login-protected data entry sheet (Supabase RLS, roles Admin/Member).
- `tech-blog/` — Technology Blog (own build and admin).
- `typing-practice/` — typing practice (`npm test` there).
- Other apps: `ludo-3d`, `bulbul-bhatia`, `mukesh-singh-dahiya`, `school-document-builder`, `RAIN ALERT`, `video-cutter`, `bbc-english`, `primary-teacher`, `marketing`, `docs`.
- `supabase/functions/` — Edge Functions (razorpay order/webhook/verify, download links). `supabase/migrations/` — SQL migrations.

## /examhelp/ (Exam Hub / TETTESTHUB platform)
- Source is NOT in this repo. It lives in repo `saymukeshofficework-hash/Chat-practice-121`, branch `feat/exam-hub-phase-1-3` (Next.js, static export). The workflow checks it out and builds it with base path `/examhelp`.
- Change examhelp pages in that repo, not here. Its Practice Paper Generator lives under `/practice-paper-generator/` there.
- This repo's workflow also rebuilds daily at 00:15 IST so examhelp picks up its latest code.

## Supabase
- Project `exam-hub`, ref `znulepzdihzhjmuvyroi`: tests, orders, notes, `ca_days` (daily current affairs, paid), Edge Functions `notes-checkout`, `razorpay-webhook`, `testhub-admin`.
- Tech blog uses a separate Supabase project (see `TECH_BLOG_ADMIN_INSTRUCTIONS.md`).
- Edge Functions called by the public site use `verify_jwt: false` with the anon key. Row Level Security protects data, not hidden buttons.
- Test questions are never public files. Only logged-in buyers can fetch them.

## Business rules (set by the owner)
- Exactly one free test per series. Series are 25 tests each.
- Products: PDF notes (₹299 MP High Court Assistant Grade-3), test series (₹199), daily current affairs (₹49/month), Bridge Course notes (₹199).
- Homepage is a login-gated page, not a public catalogue.

## More detail
`README.md`, `ADMIN_INSTRUCTIONS.md`, `SECURITY.md`, `TECH_BLOG_ADMIN_INSTRUCTIONS.md`, `docs/`. Read these only when the task needs them.
