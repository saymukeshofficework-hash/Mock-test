-- Link a paid order to the logged-in tettesthub.in student (auth user id from the main-site
-- Supabase project), so purchases unlock automatically on any device. Null for guest buyers.
alter table public.orders add column if not exists buyer_user_id uuid;
create index if not exists orders_buyer_user_id_idx on public.orders (buyer_user_id) where buyer_user_id is not null;
