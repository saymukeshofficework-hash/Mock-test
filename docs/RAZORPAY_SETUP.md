# Razorpay setup

> Verify against Razorpay's current docs (https://razorpay.com/docs/) before going live.
> razorpay.com was blocked by this build environment's network policy, so the
> integration follows Razorpay's long-standing Orders API v1 / Standard Checkout contract:
>
> * `POST https://api.razorpay.com/v1/orders` (Basic auth `key_id:key_secret`) with
>   `amount` (paise), `currency`, `receipt`, `notes`
> * Checkout: `https://checkout.razorpay.com/v1/checkout.js`, options `key`, `amount`,
>   `currency`, `order_id`, `prefill`, `handler`, event `payment.failed`
> * Payment signature = `HMAC_SHA256(order_id + "|" + payment_id, key_secret)` (hex)
> * `GET /v1/payments/{id}`, `GET /v1/orders/{id}/payments`, `POST /v1/payments/{id}/capture`
> * Webhook signature = `HMAC_SHA256(raw_body, webhook_secret)` in `X-Razorpay-Signature`;
>   event id in `X-Razorpay-Event-Id`
>
> If any of these changed, edit `supabase/functions/_shared/razorpay.ts` only.

## 1. Test Mode keys (start here)

1. Razorpay Dashboard → switch to **Test Mode** (toggle top-right).
2. **Account & Settings → API Keys → Generate Test Key.** Copy the Key ID
   (`rzp_test_…`) and Key Secret (shown once).
3. Set them as Supabase Edge Function secrets (never in the repo or GitHub):

   ```bash
   supabase secrets set --project-ref ovaubhekxjtkodkhsybg \
     RAZORPAY_KEY_ID=rzp_test_xxx RAZORPAY_KEY_SECRET=xxx
   ```
   or Dashboard → Edge Functions → Secrets.
4. Optional: GitHub repository Variable `VITE_RAZORPAY_KEY_ID=rzp_test_xxx` (only a
   fallback — the server sends the key id with every order).

## 2. Payment capture

Account & Settings → **Payment capture → Automatic** (default). If a payment is ever
left "authorized", the server captures exactly ₹199 itself during verification/recovery.

## 3. Webhook

Account & Settings → **Webhooks → Add New Webhook**

| Field | Value |
|---|---|
| URL | `https://ovaubhekxjtkodkhsybg.supabase.co/functions/v1/razorpay-webhook` |
| Secret | a long random string (e.g. `openssl rand -hex 32`) |
| Events | `payment.captured`, `payment.failed`, `order.paid`, `refund.processed` |

Then: `supabase secrets set RAZORPAY_WEBHOOK_SECRET=<same string>`.

Until this secret is set the webhook rejects everything (fails closed). Do the same
setup separately in Live Mode later — test and live webhooks/secrets are different.

## 4. Test payments

Use Razorpay's test instruments (see their "Test card / UPI details" page), e.g. UPI
`success@razorpay` / `failure@razorpay`, or their published test cards. No real money
moves in Test Mode. Follow [TESTING.md](./TESTING.md).

## 5. Going live (only when every Test Mode check passes)

1. Complete Razorpay KYC/activation; make sure your website/legal pages are filled in
   (Razorpay reviews them).
2. Live Mode → generate **Live** API keys.
3. Replace secrets: `RAZORPAY_KEY_ID=rzp_live_…`, `RAZORPAY_KEY_SECRET=…`.
4. Create the **live** webhook (same URL/events) and set its `RAZORPAY_WEBHOOK_SECRET`.
5. Update the GitHub Variable `VITE_RAZORPAY_KEY_ID` if you set it; redeploy.
6. Do one real ₹199 purchase yourself, check the admin dashboard, then refund it in
   Razorpay and confirm access was disabled.

Nothing switches to live automatically.

## 6. Refunds

Refund in Razorpay Dashboard → Payments → the payment → Refund. A full refund triggers
`refund.processed`: the order becomes `refunded` and the purchase is disabled. Partial
refunds don't change access (disable manually in /admin if wanted).
