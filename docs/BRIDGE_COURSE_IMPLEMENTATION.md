# Bridge Course Notes store — implementation

Sells **Bridge Course Notes by Rakesh Pandey** (digital PDF, ₹199) at
**https://tettesthub.in/bridge-course/**, with Razorpay payments verified server-side and
the PDF delivered from private Supabase Storage via short-lived signed URLs.

Related docs: [RAZORPAY_SETUP](./RAZORPAY_SETUP.md) · [SUPABASE_SETUP](./SUPABASE_SETUP.md) ·
[DEPLOYMENT](./DEPLOYMENT.md) · [TESTING](./TESTING.md)

---

## 1. Audit — what already existed (25 Sep 2026)

| Area | Found |
|---|---|
| Repo shape | Monorepo of independent sites combined into one GitHub Pages deploy. Root = **TET Test Hub** (static HTML/JS). Sub-apps: `bbc-english/`, `video-cutter/`, `primary-teacher/` (static); `ludo-3d/`, `bulbul-bhatia/`, `mukesh-singh-dahiya/`, `RAIN ALERT/`, `school-document-builder/` (Vite); `tech-blog/` (Astro). |
| Frameworks / package manager | npm everywhere. Vite 5 + React 18 + TypeScript + Tailwind 3 + react-router 6 in the React apps. No workspaces — each app has its own `package-lock.json`. |
| Routing | Each SPA mounts under a sub-path and uses the root `404.html` redirect trick (`?bm_redirect=` / `?msd_redirect=`) for deep links. |
| CSS / design system | Per-app Tailwind configs; no shared design system across apps. The root site uses `assets/site.css`. |
| Deployment | `.github/workflows/deploy.yml` → builds every app on push to `main`, assembles `_site/`, deploys to GitHub Pages. Custom domain `tettesthub.in` (`CNAME`). |
| Supabase | One project **`tet-test-hub`** (`ovaubhekxjtkodkhsybg`, ap-south-1) shared by TET Test Hub and the tech blog. Tables: `profiles`, `test_content`, `blog_submissions` (all RLS-enabled). Migrations: 4 (tests + blog). **No Edge Functions. No Storage buckets.** Extensions: pgcrypto, uuid-ossp, pg_stat_statements, vault. |
| Auth | Supabase Auth with synthetic emails: TET students (`@students.tettesthub.app`, 3 users) and blog admins (`@blog-admin.tettesthub.app`, 2 users). |
| Existing payments | Manual Razorpay Payment Links for TET tests — no API integration. |
| Env vars | None used by the existing apps; public Supabase URL/anon key are committed in `js/site-config.js` (public by design). |
| Analytics | None in the repo. |
| Secrets in repo | None found. |

**Consequence for this feature:** because students and blog admins are real
`authenticated` users in the same project, "logged in" can never mean "admin". Bridge
Course admins are an explicit allow-list (`bridge_admins`).

## 2. Source material

Found in Google Drive (not synced to this machine) via the Drive connector:
`bridge course notes by Rakesh pandey/` → 6 sub-folders, **40 chapter Google Docs**
(+1 duplicate). No compiled PDF exists. Details, the required production file and how to
build it: [`content/source/README.md`](../content/source/README.md) and
[`content/source/manifest.json`](../content/source/manifest.json).

Content (verified by reading chapters from four papers): every chapter has in-text
questions (पाठगत प्रश्न / Check Your Progress) with the correct option marked ✔ and an
explanation, a quick revision list, and end-of-unit answers (पाठांत प्रश्न / End
Exercises); several have practice MCQs, tables, a revision sheet, glossary and reading
guide. Five papers are in Hindi, Pedagogy of Language-II in English. The landing-page
claims in `bridge-course/src/config.ts` are limited to these observed facts.

Open questions for the seller (also in the manifest): duplicate Language-II Unit 11;
TWAU has no Unit 3/4 docs; Curriculum paper has only Unit 1.

## 3. What was added

```
bridge-course/                    new Vite + React + TS + Tailwind app (sibling-app stack)
  src/config.ts                   ← single source of truth for all displayed product info
  src/lib/{api,razorpay,access,analytics,whatsapp,base}.ts
  src/components/{BuyDialog,DownloadPanel,Layout,WhatsAppButton}.tsx
  src/pages/{Landing,Success,PaymentFailed,CheckStatus,Admin,Legal,faq}.tsx
  public/previews/sample-{1,2,3}.webp, public/og-image.png, favicon.svg
  scripts/check-bundle.mjs        secret / PDF / source-map scanner (runs in CI)
  scripts/inspect-product-pdf.mjs merge chapter PDFs + inspect the final PDF
  scripts/previews/               regenerates sample pages + share image
supabase/migrations/20260925180000_bridge_course_store.sql   (applied to the live project)
supabase/functions/_shared/{config,http,crypto,db,razorpay,fulfil,validate}.ts (+ tests)
supabase/functions/{create-razorpay-order,verify-razorpay-payment,razorpay-webhook,
                    create-download-link,order-status}/index.ts          (all deployed)
supabase/config.toml, supabase/.env.example
content/source/{README.md,manifest.json,.gitignore}   private staging (deny-all ignore)
marketing/whatsapp-message.txt
docs/*.md
```

Modified (additively): `.github/workflows/deploy.yml` (+ build/check/copy steps for
`bridge-course`), `404.html` (+ `/bridge-course/` deep-link entry), `.gitignore`
(+ env files, Bridge Course PDFs). Nothing else in the repo or database was changed.

## 4. Architecture

```
WhatsApp link ─► /bridge-course/ (static, GitHub Pages)
   BUY NOW ─► name / mobile / email
      └─► create-razorpay-order (Edge Fn) ── price from products table ─► Razorpay Orders API
             ◄── order_id, key_id, amount, BCN-reference
   Razorpay Checkout (checkout.js, loaded on demand) ─► customer pays
      └─► handler(payment_id, order_id, signature)
            └─► verify-razorpay-payment (Edge Fn)
                  1 HMAC_SHA256(order_id|payment_id, key_secret) == signature
                  2 GET /payments/:id from Razorpay → order_id, amount, INR, captured
                  3 bridge_fulfil_order()  (locks order row; idempotent)
                  4 new 256-bit token → store SHA-256 only → return raw token once
   /success ─► DOWNLOAD NOTES ─► create-download-link (Edge Fn)
                  bridge_consume_download(): active, paid, product, expiry, limit, +1
                  └─► Storage signed URL (private bucket, 300 s) ─► PDF
Razorpay ─► razorpay-webhook (Edge Fn): raw-body HMAC, event-id dedupe, same fulfilment
Recovery ─► /check-status ─► order-status (Edge Fn): reference or pay_… + email/mobile
            → asks Razorpay for the order's payments → fulfils → issues new token
Admin ─► /admin (Supabase Auth + bridge_admins) ─► admin RPCs (re-check admin in SQL)
```

### Security properties

| Threat | Why it fails |
|---|---|
| Change price in browser | No amount is sent. Server loads `products.amount_paise`; also refuses if it disagrees with `PRODUCT_AMOUNT_PAISE`. Verification re-checks amount against the order. |
| Change product slug | Only `PRODUCT_SLUG` is accepted. |
| Change PDF path | Path comes from the `products` row, never from the request. |
| Download without paying / guess token | 256-bit random token; only its SHA-256 is stored; unknown hash → "invalid". |
| Fake payment id / signature / order id | Unknown order → rejected; HMAC with the key secret; payment fetched from Razorpay and must belong to that order. |
| Replay callback | Signature is bound to one order+payment; fulfilment is idempotent (`purchases.order_id` unique, row lock). Replay only rotates that buyer's own token. |
| Replay webhook | `webhook_events.event_id` unique; processed events are acknowledged and skipped. |
| Guess an order id for recovery | Needs the random BCN reference (≈50 bits) **and** the buyer's email/mobile; 10 failures lock the order; a captured Razorpay payment is still required. |
| Read other people's orders / edit counts | RLS on all tables; browser roles have no write grants on money tables; all writes are service-role functions. |
| Open /admin | Supabase login **and** `bridge_admins` row; every admin RPC re-checks in SQL. |
| Private PDF by URL | Bucket `public = false`, no `storage.objects` policies, only signed URLs. The PDF is never in git or the build (CI check). |
| Secrets in frontend | Frontend only has `VITE_` public values; `npm run check:bundle` fails the build on secret names, `sb_secret_…`, non-anon JWTs, PDFs or source maps. |

Customer-facing errors are plain sentences; internal errors are logged as name +
message only and replaced by a generic message.

## 5. Configuration

* **Displayed** product facts, price label, chapter list, FAQ, legal placeholders,
  refund text: `bridge-course/src/config.ts` (+ `src/pages/faq.tsx`).
* **Charged** price: `public.products.amount_paise` (+ `PRODUCT_AMOUNT_PAISE` guard).
* Frontend env (public): `bridge-course/.env.example` → GitHub repository *Variables*.
* Backend secrets: `supabase/.env.example` → Supabase Edge Function secrets.

## 6. Day-to-day operations

### Changing the price
1. `update public.products set amount_paise = 24900 where slug = 'bridge-course-notes';`
2. Set secret `PRODUCT_AMOUNT_PAISE=24900` (orders are refused while the two differ).
3. Update `priceDisplay` / `priceNumber` in `src/config.ts`, `index.html` meta/JSON-LD
   and `marketing/whatsapp-message.txt`; push to `main`.
Existing orders keep the amount they were created with.

### Replacing the PDF
Upload the new file to `bridge-course-private/products/bridge-course-notes.pdf` with
"overwrite" (Dashboard → Storage), or upload under a new path and
`update products set file_path = '<new path>' …`. Buyers get the new file next time
they download. Regenerate previews if pages changed.

### Changing the WhatsApp number / support email / site URL
Edit the repository Variables `VITE_WHATSAPP_NUMBER` / `VITE_SUPPORT_EMAIL` /
`VITE_SITE_URL` and re-run the deploy workflow. (`SITE_URL` secret too if the domain changes,
for CORS.)

### Viewing sales, resetting downloads, disabling access
`/bridge-course/admin` → stats, 7-day funnel, searchable orders. Per purchase: **Reset
downloads**, **Disable / Enable access**, **Issue new download link** (shows a one-time
`…/success#t=…` link to send the customer; the previous link stops working). Refunds are
done in the Razorpay Dashboard; a full refund automatically disables access via the
`refund.processed` webhook.

### Sample pages
`public/previews/sample-*.webp` are typeset from the first part of three real chapters
(`scripts/previews/samples.mjs`), watermarked "SAMPLE / PREVIEW" and faded before the end.
Once the final PDF exists you may replace them with real page renders (`pdftoppm`, crop the
lower half, keep the watermark). Keep to ≤ 4 partial pages.

## 7. Phase 2 — buyer watermarking (not built)

`create-download-link` → `deliverFile()` already receives buyer name, email and order
reference from `bridge_consume_download()`. To watermark: stamp the master PDF with
pdf-lib in the function (or a queue), store it as
`bridge-course-private/stamped/<order_reference>.pdf`, and sign that path instead.

## 8. Current status / remaining owner actions

Done and verified: schema + RLS + bucket (live), 5 Edge Functions (live), storefront,
admin, recovery, legal pages, CI wiring, security tests (see TESTING.md).

Still needed before selling — see [DEPLOYMENT.md → Go-live checklist](./DEPLOYMENT.md#go-live-checklist):
compile + upload the PDF, set Razorpay test secrets, add the webhook, create an admin
user, set GitHub Variables (WhatsApp number), fill legal placeholders and the refund
policy, run the Test Mode checklist, then switch to live keys deliberately.
