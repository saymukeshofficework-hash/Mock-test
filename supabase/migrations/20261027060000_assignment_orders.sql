-- Bridge assignment form inbox. The public form can only INSERT; only Bridge admins can read or update.
-- Read the rows in the Supabase dashboard (Table Editor > assignment_orders); copy form_text into Claude.
create table if not exists public.assignment_orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null default '' check (char_length(name) <= 120),
  whatsapp text not null default '' check (whatsapp ~ '^[0-9]{0,15}$'),
  assignment_count smallint not null check (assignment_count between 1 and 12),
  tasks text not null check (char_length(tasks) <= 400),
  file_name text not null check (char_length(file_name) <= 200),
  form_text text not null check (char_length(form_text) <= 300000),
  status text not null default 'new' check (status in ('new', 'paid', 'in_progress', 'sent'))
);
alter table public.assignment_orders enable row level security;

revoke all on public.assignment_orders from anon, authenticated;
grant insert (name, whatsapp, assignment_count, tasks, file_name, form_text) on public.assignment_orders to anon, authenticated;
grant select, update (status) on public.assignment_orders to authenticated;

drop policy if exists "assignment_orders_insert" on public.assignment_orders;
create policy "assignment_orders_insert" on public.assignment_orders
  for insert to anon, authenticated with check (status = 'new');

drop policy if exists "assignment_orders_admin_select" on public.assignment_orders;
create policy "assignment_orders_admin_select" on public.assignment_orders
  for select to authenticated using ((select public.is_bridge_admin()));

drop policy if exists "assignment_orders_admin_update" on public.assignment_orders;
create policy "assignment_orders_admin_update" on public.assignment_orders
  for update to authenticated using ((select public.is_bridge_admin())) with check ((select public.is_bridge_admin()));
