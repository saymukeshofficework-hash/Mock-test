-- Payment Integration Schema for Razorpay
-- Run this migration in Supabase SQL Editor

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  student_id text not null,
  amount integer not null,  -- amount in paise (multiply by 100 for conversion from rupees)
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  razorpay_signature text,
  test_ids text[] not null default '{}',  -- tests being purchased
  receipt text unique,
  description text,
  notes jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  test_id text not null,
  price integer not null,  -- price in paise
  created_at timestamptz not null default now()
);

create table if not exists payment_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete cascade,
  event_type text not null,  -- 'payment_created', 'payment_captured', 'payment_failed', 'webhook_received'
  razorpay_event_id text,
  payload jsonb,
  status text,
  error_message text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_orders_user_id on orders (user_id);
create index if not exists idx_orders_student_id on orders (student_id);
create index if not exists idx_orders_razorpay_order_id on orders (razorpay_order_id);
create index if not exists idx_orders_razorpay_payment_id on orders (razorpay_payment_id);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_order_items_order_id on order_items (order_id);
create index if not exists idx_payment_logs_order_id on payment_logs (order_id);
create index if not exists idx_payment_logs_razorpay_event_id on payment_logs (razorpay_event_id);

-- Row Level Security
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payment_logs enable row level security;

-- Allow logged-in users to read their own orders
drop policy if exists "orders_select_own" on orders;
create policy "orders_select_own"
  on orders for select
  using (user_id = auth.uid());

-- Allow logged-in users to read items from their orders
drop policy if exists "order_items_select_own_orders" on order_items;
create policy "order_items_select_own_orders"
  on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- Disable all write access from the frontend
-- Payment creation/updates happen only through the backend API
