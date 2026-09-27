# Testing

## A. Already run during implementation (25 Sep 2026)

This build environment could not reach razorpay.com or *.supabase.co over HTTP, and no
Razorpay keys exist yet, so a real Test Mode payment has **not** been made. What was
verified:

### Database (live project, run as the `anon` / a real student `authenticated` role, rolled back)

| Attack | Result |
|---|---|
| anon reads orders / purchases | `permission denied` ✅ |
| anon updates product price | `permission denied` ✅ |
| anon marks order paid / resets download count | `permission denied` ✅ |
| anon calls fulfil / consume-download / admin RPCs | `permission denied for function` ✅ |
| anon lists objects in the private bucket | 0 rows ✅ (bucket `public = false`) |
| anon inserts an invalid analytics event name | rejected by check constraint ✅ |
| logged-in TET student reads orders / purchases | 0 rows ✅ |
| student calls admin stats / purchase action | `forbidden` ✅ |
| fulfil with wrong amount | `amount_mismatch` ✅ |
| fulfil the same order twice (callback + webhook) | 1 purchase, 1 payment, 2nd call `newly_fulfilled=false` ✅ |
| 6th download with limit 5 | `limit` ✅ · disabled → `disabled` ✅ · expired → `expired` ✅ · guessed hash → `invalid` ✅ |

### Deployed Edge Functions (called from inside Postgres via pg_net, which was enabled for the test and removed afterwards)

| Request | Result |
|---|---|
| no `apikey` header | 401 "Unauthorized request." ✅ |
| malformed token / guessed 43-char token | 400 / 404 "This download link is not valid…" ✅ |
| recovery with made-up reference | 404 "We could not find a matching order…" ✅ |
| verify with fake order id + fake signature | 400 "We could not confirm your payment yet…" ✅ |
| verify with SQL-ish garbage | 400 "Invalid request." ✅ |
| create order with another product slug | 400 "This product is not available." ✅ |
| create order with bad phone | 400 validation message ✅ |
| webhook with no signature | 400 ✅ · with fake signature → generic 500 until `RAZORPAY_WEBHOOK_SECRET` is set (fails closed), 400 after |
| seeded paid purchase: token status | 200 active, 5 downloads left ✅ |
| download while PDF not uploaded | 503 friendly message, download count **not** consumed ✅ |
| recovery, wrong contact | 404 + `lookup_failures` incremented ✅ |
| recovery, right contact (lower-case ref, `+91` phone) | 200 new token; old token invalid; Deno SHA-256 = Postgres digest ✅ |

All test rows were deleted afterwards (all Bridge tables at 0 rows).

### Unit tests — `deno test supabase/functions/_shared/` → 8 passed
Payment/webhook HMAC known-answer vectors (cross-checked with Node crypto), tamper
detection, SHA-256 vector, constant-time compare, token/reference format and uniqueness,
phone normalisation.

### Frontend (Chromium via Playwright, served under `/bridge-course/` with the real 404.html)
* 360 / 390 / 412 / 768 / 1280 px: no horizontal scroll, no JS errors.
* All routes load by direct URL (deep-link fallback works).
* Checkout flow with mocked Razorpay + functions: success → `/success` → refresh keeps the
  download → download sends the stored token; `payment.failed` → `/payment-failed`;
  verify error → automatic recovery → `/success`. The create-order request contains **no
  amount**. (Found and fixed: pasting `+91 98765 43210` was truncated by the input.)
* `npm run check:bundle`: no secret names/values, no PDF, no source maps.

## B. Test Mode checklist (owner, after setting test keys + webhook + uploading the PDF)

Use a phone on mobile data, opened from a WhatsApp message link.

| # | Step | Expect |
|---|---|---|
| 1 | Open the link from WhatsApp | page loads fast, ₹199 visible, no sideways scroll |
| 2 | BUY NOW → fill details | validation messages for bad phone/email |
| 3 | PAY ₹199 SECURELY | Razorpay opens with ₹199, your name/email/phone prefilled |
| 4 | Pay with `success@razorpay` / test card | "Verifying…" then ✅ Payment Successful |
| 5 | Admin | order `paid`, payment id, method |
| 6 | Supabase `webhook_events` | `payment.captured` / `order.paid` rows, `processed = true`, note `settle: paid` |
| 7 | Purchases | exactly one row for the order |
| 8 | DOWNLOAD NOTES | PDF downloads; "4 downloads left" |
| 9 | Failed payment (`failure@razorpay`) | /payment-failed, order `failed` after webhook, no purchase |
| 10 | Duplicate callback: re-POST the same verify body (browser devtools → copy as fetch) | 200, still one purchase |
| 11 | Duplicate webhook: Razorpay Dashboard → Webhooks → resend an event | 200 `duplicate: true`, nothing changes |
| 12 | Invalid signature: change one character of `razorpay_signature` and re-POST | 400, no change |
| 13 | Invalid token: edit the token in localStorage `bc_access_v1` | "not valid" |
| 14 | Expired: `update purchases set expires_at = now() - interval '1 minute' …` | "expired" message |
| 15 | Download limit: download 5 times | 6th → limit message; admin **Reset downloads** fixes it |
| 16 | Refresh /success | still shows DOWNLOAD NOTES |
| 17 | Close the tab mid-payment, then /check-status with BCN ref + phone | access restored |
| 18 | /check-status with the `pay_…` id from the Razorpay receipt | access restored |
| 19 | Signed URL after 5 minutes | Storage returns an error |
| 20 | Private PDF public URL (SUPABASE_SETUP §4) | error, not the PDF |
| 21 | /admin logged out or as a non-admin | login form / "not a Bridge Course admin" |
| 22 | Admin: Disable access → download | "disabled"; Enable → works |
| 23 | Admin: Issue new download link → open it on another phone | download works; old device's link stops |
| 24 | Full refund in Razorpay | order `refunded`, access disabled |

## C. Security attack list (spec §32)

| | Attack | Covered by |
|---|---|---|
| A | change price in browser | no amount field; A-DB "price update" + B3 |
| B | change product slug | Edge test "another product slug" |
| C | change PDF path | path only from `products` row; nothing accepted from request |
| D | download without payment | guessed token → invalid; B9 |
| E | fake payment id | verify fetches payment from Razorpay; must match order |
| F | fake signature | Edge test + B12 |
| G | fake order id | Edge test "fake order id" |
| H | replay callback | DB "fulfil twice" + B10 |
| I | replay webhook | unique `event_id` + B11 |
| J | guess access token | 256-bit token, hash lookup; Edge test |
| K | open admin unauthenticated | B21 + DB "student admin → forbidden" |
| L | access private PDF directly | bucket private, anon sees 0 objects; B20 |
| M | another user's purchase | RLS: student sees 0 rows; recovery needs matching contact |
| N | modify download count from frontend | DB "anon/student update → permission denied" |
