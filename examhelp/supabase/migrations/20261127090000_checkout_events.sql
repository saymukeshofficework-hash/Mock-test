-- Checkout funnel log (27 Nov 2026): opened / closed / failed reason per Razorpay order.
-- Insert-only for the public site; read it with the service role (SQL editor).
create table if not exists public.checkout_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  order_id text check (order_id is null or length(order_id) <= 40),
  product text check (product is null or length(product) <= 40),
  ev text not null check (length(ev) <= 30),
  detail text check (detail is null or length(detail) <= 300),
  ua text check (ua is null or length(ua) <= 300)
);
alter table public.checkout_events enable row level security;
create policy checkout_events_insert on public.checkout_events for insert to anon, authenticated with check (true);
grant insert on public.checkout_events to anon, authenticated;
grant usage on sequence public.checkout_events_id_seq to anon, authenticated;
create index if not exists checkout_events_created_idx on public.checkout_events (created_at desc);
