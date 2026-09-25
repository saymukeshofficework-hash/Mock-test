# Supabase setup

Project: **tet-test-hub** (`ovaubhekxjtkodkhsybg`, ap-south-1) — the same project used by
TET Test Hub and the tech blog. Everything below is **additive**; never run
`supabase db reset` against this project.

## 1. Database — already applied

`supabase/migrations/20260925180000_bridge_course_store.sql` was applied on 25 Sep 2026
(migration name `bridge_course_store`). It creates:

| Object | Purpose |
|---|---|
| `products` | product row; `amount_paise = 19900`, `currency = INR`, file bucket/path |
| `orders` | one per checkout attempt; unique `razorpay_order_id`, random `public_reference` (BCN-…) |
| `payments` | Razorpay payments; unique `razorpay_payment_id` |
| `purchases` | one per paid order (unique `order_id`); `access_token_hash`, download counters, expiry, `active` |
| `webhook_events` | every verified webhook; unique `event_id` |
| `bridge_admins` | allow-list of admin `auth.users` ids |
| `analytics_events` | insert-only funnel counts (no personal data) |
| `bridge_fulfil_order`, `bridge_set_access_token`, `bridge_consume_download`, `bridge_token_status` | service-role-only SECURITY DEFINER functions used by Edge Functions |
| `bridge_admin_stats`, `bridge_admin_list_orders`, `bridge_admin_purchase_action`, `is_bridge_admin` | admin RPCs; each re-checks `bridge_admins` |
| bucket `bridge-course-private` | **private**, PDF only, 100 MB limit, no object policies |

RLS is enabled on every table. The browser can read only active `products` and insert
`analytics_events`. `anon`/`authenticated` have no insert/update/delete grants on the
money tables.

To re-apply on another project: SQL Editor → paste the migration → Run (it is idempotent),
or `supabase db push` with that project linked.

> The Security Advisor lists the admin RPCs as "signed-in users can execute SECURITY
> DEFINER function". This is intentional: they raise `forbidden` unless the caller is in
> `bridge_admins`. `is_bridge_admin()` only reveals the caller's own status.

## 2. Edge Functions — already deployed

`create-razorpay-order`, `verify-razorpay-payment`, `razorpay-webhook`,
`create-download-link`, `order-status` — all with **verify_jwt = false** (required for
`sb_publishable_…` keys, which aren't JWTs). Each function authorises in code:
publishable-key check on `apikey`, Razorpay signatures, hashed tokens.

Redeploy after code changes:

```bash
supabase login
supabase functions deploy --project-ref ovaubhekxjtkodkhsybg   # uses supabase/config.toml
```

Run unit tests: `deno test supabase/functions/_shared/`.

## 3. Secrets

Dashboard → Edge Functions → **Secrets** (or `supabase secrets set --env-file supabase/.env`
with a local, git-ignored copy of `supabase/.env.example`).

| Secret | Required | Value |
|---|---|---|
| `RAZORPAY_KEY_ID` | yes | `rzp_test_…` (later `rzp_live_…`) |
| `RAZORPAY_KEY_SECRET` | yes | from Razorpay |
| `RAZORPAY_WEBHOOK_SECRET` | yes | the webhook secret you chose |
| `SITE_URL` | recommended | `https://tettesthub.in/bridge-course/` (its origin is allowed by CORS) |
| `ALLOWED_ORIGINS` | optional | extra comma-separated origins (defaults to localhost dev) |
| `DOWNLOAD_URL_EXPIRY_SECONDS` | optional | `300` |
| `MAX_DOWNLOADS` | optional | `5` (applies to new purchases) |
| `ACCESS_TOKEN_EXPIRY_DAYS` | optional | `30` |
| `PRODUCT_SLUG` / `PRODUCT_AMOUNT_PAISE` / `PRODUCT_CURRENCY` | optional | `bridge-course-notes` / `19900` / `INR` |
| `STORAGE_BUCKET` / `PRODUCT_FILE_PATH` / `DOWNLOAD_FILE_NAME` | optional | defaults as in `.env.example` |

`SUPABASE_URL` and the secret/service-role keys are injected by the platform — never set
or copy them anywhere.

## 4. Storage — upload the PDF

1. Build/inspect the file (`content/source/README.md`).
2. Dashboard → **Storage → bridge-course-private** → create folder `products` → upload
   the PDF, then rename it to exactly `bridge-course-notes.pdf`
   (full path: `products/bridge-course-notes.pdf`).
3. **Do not** make the bucket public and do not click "Get URL"/public link. Buyers get
   signed URLs from `create-download-link` only.
4. Check it is private: open
   `https://ovaubhekxjtkodkhsybg.supabase.co/storage/v1/object/public/bridge-course-private/products/bridge-course-notes.pdf`
   in a private window — it must return an error, not the PDF.

## 5. Admin account

Existing students/blog admins can't use /admin; create a dedicated account:

1. Dashboard → **Authentication → Users → Add user** → your email + strong password,
   tick **Auto Confirm User**.
2. SQL Editor:
   ```sql
   insert into public.bridge_admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```
3. Sign in at `https://tettesthub.in/bridge-course/admin`.

Remove an admin: `delete from public.bridge_admins where user_id = (select id from auth.users where email = '…');`

Recommended: Authentication → enable **leaked password protection** (flagged by the
Security Advisor for the whole project).

## 6. Useful SQL

```sql
-- sales summary
select status, count(*), sum(amount_paise)/100 as rupees from orders group by status;
-- find a buyer
select public_reference, status, buyer_name, buyer_phone, created_at from orders
where buyer_phone = '98xxxxxxxx' or buyer_email ilike '%name%';
-- give 5 more downloads
update purchases set max_downloads = max_downloads + 5
where order_id = (select id from orders where public_reference = 'BCN-XXXXXXXXXX');
```
