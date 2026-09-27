# Deployment

The store is one more app in the existing GitHub Pages deploy
(`.github/workflows/deploy.yml`, triggered by pushes to `main`). It is built from
`bridge-course/` and copied to `_site/bridge-course/`, i.e.
**https://tettesthub.in/bridge-course/**. No other workflow was added or changed.

## What the workflow does for this app

1. `npm ci` in `bridge-course/`
2. `npm run build` with **public** `VITE_*` values from repository *Variables*
3. `npm run check:bundle` — fails the deploy if the build contains secret names, a
   Supabase secret key / non-anon JWT, any PDF, or source maps
4. copies `bridge-course/dist/` to `_site/bridge-course/`

Deep links (`/bridge-course/success`, `/admin`, …) work through the root `404.html`,
which redirects to `/bridge-course/index.html?bc_redirect=…`; `src/main.tsx` restores the
path.

## GitHub repository Variables (not Secrets)

Settings → Secrets and variables → Actions → **Variables** tab → New repository variable:

| Variable | Example | Notes |
|---|---|---|
| `VITE_WHATSAPP_NUMBER` | `919876543210` | digits with country code; empty = WhatsApp buttons hidden, support links go to /contact |
| `VITE_SUPPORT_EMAIL` | `help@example.com` | optional, shown on /contact |
| `VITE_SITE_URL` | `https://tettesthub.in/bridge-course/` | optional (this is the default) |
| `VITE_SUPABASE_URL` | `https://ovaubhekxjtkodkhsybg.supabase.co` | optional (default) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` | optional (default = project's publishable key) |
| `VITE_RAZORPAY_KEY_ID` | `rzp_test_…` | optional fallback |

These values are public by nature. **Never** add Razorpay secrets or Supabase secret
keys to GitHub — they belong only in Supabase Edge Function secrets.

After changing a Variable, re-run: Actions → *Deploy to GitHub Pages* → Run workflow.

## Local development

```bash
cd bridge-course
cp .env.example .env.local        # fill VITE_WHATSAPP_NUMBER etc.; git-ignored
npm install
npm run dev                       # http://localhost:5173
npm run build && npm run check:bundle
```

localhost:5173 / 4173 are allowed by the functions' CORS defaults.

## Go-live checklist

- [ ] Final PDF compiled, inspected, uploaded to `bridge-course-private/products/bridge-course-notes.pdf` ([SUPABASE_SETUP §4](./SUPABASE_SETUP.md#4-storage--upload-the-pdf))
- [ ] Public-URL check of the PDF fails (bucket is private)
- [ ] Razorpay **test** keys + webhook secret set; webhook created ([RAZORPAY_SETUP](./RAZORPAY_SETUP.md))
- [ ] `SITE_URL` secret set
- [ ] Admin user created and added to `bridge_admins`
- [ ] `VITE_WHATSAPP_NUMBER` Variable set; redeployed
- [ ] Legal placeholders in `bridge-course/src/config.ts` → `business` filled in
- [ ] Refund policy written in `refundPolicy` (set `isPlaceholder: false`)
- [ ] Open questions in `content/source/manifest.json` resolved; chapter list in `config.ts` matches the PDF
- [ ] Full [TESTING.md](./TESTING.md) Test Mode run passed on a real phone
- [ ] Switch to **live** keys + live webhook deliberately; one real purchase + refund
- [ ] Share `marketing/whatsapp-message.txt` in groups
