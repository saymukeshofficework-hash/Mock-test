-- Bridge Course Notes store — products, orders, payments, purchases, webhook events.
--
-- Lives in the SAME Supabase project as TET Test Hub (supabase/schema.sql) and the
-- Technology Blog (supabase/blog_admin_schema.sql). Additive only: it creates new
-- tables/functions and touches nothing that already exists. See
-- docs/SUPABASE_SETUP.md for how it was applied and how to re-apply it.
--
-- Security model (see docs/BRIDGE_COURSE_IMPLEMENTATION.md):
--   * The browser (anon / publishable key) can read ONLY active products and insert
--     analytics events. It cannot read or write orders, payments, purchases,
--     webhook events or admin lists.
--   * Every privileged write goes through an Edge Function running with the secret
--     (service-role) key, which calls the SECURITY DEFINER functions below. Those
--     functions are granted to service_role only.
--   * Existing TET students and blog admins are real `authenticated` users in this
--     project, so "logged in" is NOT enough to be a Bridge Course admin: admins are
--     listed explicitly in public.bridge_admins.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR' check (currency = 'INR'),
  file_bucket text not null default 'bridge-course-private',
  file_path text not null default 'products/bridge-course-notes.pdf',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Short, random, customer-facing reference (e.g. BCN-7K2QX9M4TA). Never the uuid.
  public_reference text not null unique,
  product_id uuid not null references public.products (id),
  buyer_name text not null check (char_length(buyer_name) between 2 and 80),
  buyer_email text not null check (char_length(buyer_email) between 5 and 254),
  buyer_phone text not null check (buyer_phone ~ '^[6-9][0-9]{9}$'),
  amount_paise integer not null check (amount_paise > 0),
  currency text not null default 'INR',
  razorpay_order_id text unique,
  status text not null default 'created'
    check (status in ('created', 'payment_pending', 'paid', 'failed', 'refunded', 'cancelled')),
  -- Failed "check payment status" attempts, to stop brute-forcing the recovery form.
  lookup_failures integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_buyer_phone_idx on public.orders (buyer_phone, created_at desc);
create index if not exists orders_buyer_email_idx on public.orders (lower(buyer_email));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id),
  razorpay_payment_id text not null unique,
  razorpay_order_id text not null,
  razorpay_signature text,
  amount_paise integer not null,
  currency text not null,
  status text not null,
  method text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);
create index if not exists payments_order_id_idx on public.payments (order_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id),
  product_id uuid not null references public.products (id),
  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null,
  -- SHA-256 (hex) of the customer's raw access token. The raw token is never stored.
  -- Null until a token is issued (e.g. the webhook fulfilled the order before the
  -- browser's verify call arrived).
  access_token_hash text unique,
  download_count integer not null default 0 check (download_count >= 0),
  max_downloads integer not null default 5 check (max_downloads >= 0),
  last_download_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  active boolean not null default true
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  processing_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.bridge_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- First-party funnel analytics (no third-party tracker). Insert-only for the browser.
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event text not null check (event in (
    'landing_page_view', 'buy_button_click', 'checkout_opened',
    'payment_success', 'payment_failed', 'download_started')),
  source text check (char_length(source) <= 64),
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function public.bridge_set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.bridge_set_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
  for each row execute function public.bridge_set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.purchases enable row level security;
alter table public.webhook_events enable row level security;
alter table public.bridge_admins enable row level security;
alter table public.analytics_events enable row level security;

-- Belt and braces: the browser roles get no write privileges on the money tables at
-- all, so even a mistakenly-added permissive policy could not let them write.
revoke insert, update, delete, truncate on public.products, public.orders, public.payments,
  public.purchases, public.webhook_events, public.bridge_admins
  from anon, authenticated;
revoke select on public.orders, public.payments, public.purchases, public.webhook_events
  from anon;
revoke update, delete, truncate on public.analytics_events from anon, authenticated;

create or replace function public.is_bridge_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.bridge_admins where user_id = auth.uid());
$$;
revoke all on function public.is_bridge_admin() from public;
-- anon needs EXECUTE too because the products policy calls it (it just returns false).
grant execute on function public.is_bridge_admin() to anon, authenticated, service_role;

-- Anyone may read ACTIVE products (name + price are public on the landing page anyway).
drop policy if exists "products_select_active" on public.products;
create policy "products_select_active" on public.products
  for select using (active or (select public.is_bridge_admin()));

-- Admins (and only admins) may read orders, payments, purchases, webhook events.
drop policy if exists "orders_admin_select" on public.orders;
create policy "orders_admin_select" on public.orders
  for select to authenticated using ((select public.is_bridge_admin()));

drop policy if exists "payments_admin_select" on public.payments;
create policy "payments_admin_select" on public.payments
  for select to authenticated using ((select public.is_bridge_admin()));

drop policy if exists "purchases_admin_select" on public.purchases;
create policy "purchases_admin_select" on public.purchases
  for select to authenticated using ((select public.is_bridge_admin()));

drop policy if exists "webhook_events_admin_select" on public.webhook_events;
create policy "webhook_events_admin_select" on public.webhook_events
  for select to authenticated using ((select public.is_bridge_admin()));

-- A logged-in user may see only their own admin row (lets the UI ask "am I admin?").
drop policy if exists "bridge_admins_select_own" on public.bridge_admins;
create policy "bridge_admins_select_own" on public.bridge_admins
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "analytics_events_insert" on public.analytics_events;
create policy "analytics_events_insert" on public.analytics_events
  for insert to anon, authenticated with check (true);
drop policy if exists "analytics_events_admin_select" on public.analytics_events;
create policy "analytics_events_admin_select" on public.analytics_events
  for select to authenticated using ((select public.is_bridge_admin()));

-- ---------------------------------------------------------------------------
-- Server-side (service_role only) functions used by the Edge Functions
-- ---------------------------------------------------------------------------

-- Mark an order paid, record the payment and create the purchase — atomically and
-- idempotently. Safe to call any number of times for the same order/payment (browser
-- callback, webhook, recovery check can all race). Returns the purchase id and
-- whether this call was the one that fulfilled the order.
create or replace function public.bridge_fulfil_order(
  p_order_id uuid,
  p_razorpay_payment_id text,
  p_razorpay_signature text,
  p_amount_paise integer,
  p_currency text,
  p_payment_status text,
  p_method text,
  p_email text,
  p_phone text,
  p_max_downloads integer,
  p_access_days integer
)
returns table (purchase_id uuid, newly_fulfilled boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_purchase_id uuid;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if p_amount_paise <> v_order.amount_paise or p_currency <> v_order.currency then
    raise exception 'amount_mismatch';
  end if;
  if v_order.status in ('refunded', 'cancelled') then
    raise exception 'order_not_payable';
  end if;

  insert into public.payments (order_id, razorpay_payment_id, razorpay_order_id,
    razorpay_signature, amount_paise, currency, status, method, email, phone)
  values (p_order_id, p_razorpay_payment_id, v_order.razorpay_order_id,
    p_razorpay_signature, p_amount_paise, p_currency, p_payment_status, p_method,
    p_email, p_phone)
  on conflict (razorpay_payment_id) do update
    set status = excluded.status,
        razorpay_signature = coalesce(public.payments.razorpay_signature, excluded.razorpay_signature);

  select id into v_purchase_id from public.purchases where order_id = p_order_id;
  if v_purchase_id is not null then
    if v_order.status <> 'paid' then
      update public.orders set status = 'paid' where id = p_order_id;
    end if;
    return query select v_purchase_id, false;
    return;
  end if;

  update public.orders set status = 'paid' where id = p_order_id;

  insert into public.purchases (order_id, product_id, buyer_name, buyer_email, buyer_phone,
    max_downloads, expires_at)
  values (p_order_id, v_order.product_id, v_order.buyer_name, v_order.buyer_email,
    v_order.buyer_phone, p_max_downloads, now() + make_interval(days => p_access_days))
  returning id into v_purchase_id;

  return query select v_purchase_id, true;
end;
$$;

-- Attach a freshly generated access token (hash only) to a purchase, rotating any
-- previous one, and extend its expiry. Used by verify / recovery / admin re-issue.
create or replace function public.bridge_set_access_token(
  p_purchase_id uuid,
  p_token_hash text,
  p_access_days integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'bad_token_hash';
  end if;
  update public.purchases
     set access_token_hash = p_token_hash,
         expires_at = greatest(expires_at, now() + make_interval(days => p_access_days))
   where id = p_purchase_id;
end;
$$;

-- Atomically check every download rule and consume one download. Returns the file
-- location only if ALL of: token matches, purchase active, not expired, under the
-- limit, order paid, product matches. Otherwise returns a reason and consumes nothing.
create or replace function public.bridge_consume_download(p_token_hash text)
returns table (ok boolean, reason text, file_bucket text, file_path text,
  downloads_left integer, buyer_name text, buyer_email text, order_reference text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
begin
  select pu.id, pu.active, pu.expires_at, pu.download_count, pu.max_downloads,
         pu.product_id, pu.buyer_name, pu.buyer_email,
         o.status as order_status, o.product_id as order_product_id, o.public_reference,
         p.file_bucket, p.file_path
    into r
    from public.purchases pu
    join public.orders o on o.id = pu.order_id
    join public.products p on p.id = pu.product_id
   where pu.access_token_hash = p_token_hash
   for update of pu;

  if not found then
    return query select false, 'invalid', null::text, null::text, null::integer, null::text, null::text, null::text; return;
  end if;
  if not r.active then
    return query select false, 'disabled', null::text, null::text, null::integer, null::text, null::text, null::text; return;
  end if;
  if r.order_status <> 'paid' or r.order_product_id <> r.product_id then
    return query select false, 'not_paid', null::text, null::text, null::integer, null::text, null::text, null::text; return;
  end if;
  if r.expires_at <= now() then
    return query select false, 'expired', null::text, null::text, null::integer, null::text, null::text, null::text; return;
  end if;
  if r.download_count >= r.max_downloads then
    return query select false, 'limit', null::text, null::text, 0, null::text, null::text, null::text; return;
  end if;

  update public.purchases
     set download_count = download_count + 1, last_download_at = now()
   where id = r.id;

  return query select true, 'ok', r.file_bucket, r.file_path,
    r.max_downloads - r.download_count - 1, r.buyer_name, r.buyer_email, r.public_reference;
end;
$$;

-- Read-only status for a token (success page refresh): never consumes a download.
create or replace function public.bridge_token_status(p_token_hash text)
returns table (valid boolean, reason text, downloads_left integer, expires_at timestamptz,
  product_name text, amount_paise integer, order_reference text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (pu.active and o.status = 'paid' and pu.expires_at > now() and pu.download_count < pu.max_downloads),
    case when not pu.active then 'disabled'
         when o.status <> 'paid' then 'not_paid'
         when pu.expires_at <= now() then 'expired'
         when pu.download_count >= pu.max_downloads then 'limit'
         else 'ok' end,
    greatest(pu.max_downloads - pu.download_count, 0),
    pu.expires_at, p.name, o.amount_paise, o.public_reference
  from public.purchases pu
  join public.orders o on o.id = pu.order_id
  join public.products p on p.id = pu.product_id
  where pu.access_token_hash = p_token_hash;
$$;

revoke all on function public.bridge_fulfil_order(uuid, text, text, integer, text, text, text, text, text, integer, integer) from public, anon, authenticated;
revoke all on function public.bridge_set_access_token(uuid, text, integer) from public, anon, authenticated;
revoke all on function public.bridge_consume_download(text) from public, anon, authenticated;
revoke all on function public.bridge_token_status(text) from public, anon, authenticated;
grant execute on function public.bridge_fulfil_order(uuid, text, text, integer, text, text, text, text, text, integer, integer) to service_role;
grant execute on function public.bridge_set_access_token(uuid, text, integer) to service_role;
grant execute on function public.bridge_consume_download(text) to service_role;
grant execute on function public.bridge_token_status(text) to service_role;

-- ---------------------------------------------------------------------------
-- Admin functions (authenticated + listed in bridge_admins)
-- ---------------------------------------------------------------------------

create or replace function public.bridge_admin_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today_start timestamptz := date_trunc('day', now() at time zone 'Asia/Kolkata') at time zone 'Asia/Kolkata';
begin
  if not public.is_bridge_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'total_orders', (select count(*) from public.orders),
    'paid_orders', (select count(*) from public.orders where status = 'paid'),
    'failed_orders', (select count(*) from public.orders where status = 'failed'),
    'pending_orders', (select count(*) from public.orders where status in ('created', 'payment_pending')),
    'refunded_orders', (select count(*) from public.orders where status = 'refunded'),
    'revenue_paise', (select coalesce(sum(amount_paise), 0) from public.orders where status = 'paid'),
    'today_paid_orders', (select count(*) from public.orders where status = 'paid' and updated_at >= v_today_start),
    'today_revenue_paise', (select coalesce(sum(amount_paise), 0) from public.orders where status = 'paid' and updated_at >= v_today_start),
    'funnel_7d', (select coalesce(jsonb_object_agg(event, n), '{}'::jsonb) from (
        select event, count(*) as n from public.analytics_events
        where created_at >= now() - interval '7 days' group by event) f)
  );
end;
$$;

create or replace function public.bridge_admin_list_orders(p_search text default null, p_limit integer default 100)
returns table (
  order_id uuid, public_reference text, created_at timestamptz, status text,
  buyer_name text, buyer_email text, buyer_phone text, amount_paise integer,
  razorpay_order_id text, razorpay_payment_id text, payment_method text,
  purchase_id uuid, download_count integer, max_downloads integer,
  last_download_at timestamptz, access_active boolean, access_expires_at timestamptz,
  has_token boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_bridge_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  select o.id, o.public_reference, o.created_at, o.status,
         o.buyer_name, o.buyer_email, o.buyer_phone, o.amount_paise,
         o.razorpay_order_id,
         (select pm.razorpay_payment_id from public.payments pm where pm.order_id = o.id
            order by (pm.status = 'captured') desc, pm.created_at desc limit 1),
         (select pm.method from public.payments pm where pm.order_id = o.id
            order by (pm.status = 'captured') desc, pm.created_at desc limit 1),
         pu.id, pu.download_count, pu.max_downloads, pu.last_download_at, pu.active,
         pu.expires_at, pu.access_token_hash is not null
    from public.orders o
    left join public.purchases pu on pu.order_id = o.id
   where p_search is null or p_search = ''
      or o.public_reference ilike '%' || p_search || '%'
      or o.buyer_email ilike '%' || p_search || '%'
      or o.buyer_phone ilike '%' || p_search || '%'
      or o.buyer_name ilike '%' || p_search || '%'
      or o.razorpay_order_id ilike '%' || p_search || '%'
   order by o.created_at desc
   limit least(greatest(p_limit, 1), 500);
end;
$$;

-- p_action: 'reset_downloads' | 'disable' | 'enable' | 'issue_link'
-- 'issue_link' returns a NEW raw access token (shown once to the admin, who can send
-- it to the customer); every other action returns null.
create or replace function public.bridge_admin_purchase_action(p_purchase_id uuid, p_action text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_token text;
begin
  if not public.is_bridge_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if not exists (select 1 from public.purchases where id = p_purchase_id) then
    raise exception 'purchase_not_found';
  end if;

  if p_action = 'reset_downloads' then
    update public.purchases set download_count = 0 where id = p_purchase_id;
  elsif p_action = 'disable' then
    update public.purchases set active = false where id = p_purchase_id;
  elsif p_action = 'enable' then
    update public.purchases set active = true where id = p_purchase_id;
  elsif p_action = 'issue_link' then
    v_token := rtrim(translate(encode(extensions.gen_random_bytes(32), 'base64'), '+/', '-_'), '=');
    update public.purchases
       set access_token_hash = encode(extensions.digest(v_token, 'sha256'), 'hex'),
           expires_at = greatest(expires_at, now() + interval '30 days')
     where id = p_purchase_id;
    return v_token;
  else
    raise exception 'unknown_action';
  end if;
  return null;
end;
$$;

revoke all on function public.bridge_admin_stats() from public, anon;
revoke all on function public.bridge_admin_list_orders(text, integer) from public, anon;
revoke all on function public.bridge_admin_purchase_action(uuid, text) from public, anon;
grant execute on function public.bridge_admin_stats() to authenticated;
grant execute on function public.bridge_admin_list_orders(text, integer) to authenticated;
grant execute on function public.bridge_admin_purchase_action(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Seed product (price lives HERE, not in the browser)
-- ---------------------------------------------------------------------------

insert into public.products (slug, name, description, amount_paise, currency, active)
values (
  'bridge-course-notes',
  'Bridge Course Notes by Rakesh Pandey',
  'Complete digital PDF notes for the Bridge Course 2.0 — six papers, Hindi and English.',
  19900, 'INR', true
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Private Storage bucket for the paid PDF (NO public access, NO object policies:
-- only the service role — i.e. the create-download-link Edge Function — can read it,
-- and it only ever hands out short-lived signed URLs).
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bridge-course-private', 'bridge-course-private', false, 104857600, array['application/pdf'])
on conflict (id) do update set public = false;
