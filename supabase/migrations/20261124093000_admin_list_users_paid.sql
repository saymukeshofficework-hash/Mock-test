-- Admin "Users" menu: split into Paid and Non-paid users (owner, 2026-11-24).
-- Paid orders live in the exam-hub project; the admin page gets them from notes-checkout
-- (action admin_paid_users, admin token only) and passes the buyers here:
--   p_paid_ids      = buyer_user_id of paid orders
--   p_paid_contacts = lower-case emails and last-10-digit phones of paid orders (old orders had no user id)
--   p_paid          = true → only paid, false → only non-paid, null → everyone
-- Still admin-only: is_bridge_admin() is re-checked, as before.
drop function if exists public.admin_list_users(text, integer, integer);
create or replace function public.admin_list_users(
  p_search text default null, p_limit integer default 50, p_offset integer default 0,
  p_paid boolean default null, p_paid_ids uuid[] default null, p_paid_contacts text[] default null)
returns table (
  user_id uuid, full_name text, contact text, email text, phone text,
  created_at timestamptz, last_sign_in_at timestamptz, total_users bigint, matched_users bigint,
  is_paid boolean, paid_users bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s text := nullif(trim(coalesce(p_search, '')), '');
  ids uuid[] := coalesce(p_paid_ids, '{}');
  cts text[] := coalesce(p_paid_contacts, '{}');
begin
  if not public.is_bridge_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  with u0 as (
    select a.id,
           coalesce(a.raw_user_meta_data->>'full_name', a.raw_user_meta_data->>'name') as nm,
           a.raw_user_meta_data->>'contact_identifier' as ci,
           a.email::text as em, a.phone::text as ph, a.created_at as ca, a.last_sign_in_at as ls
      from auth.users a
     where a.deleted_at is null
  ), u as (
    select u0.*,
           coalesce(u0.id = any(ids)
            or lower(u0.em) = any(cts) or lower(u0.ci) = any(cts)
            or nullif(right(regexp_replace(coalesce(u0.ph, ''), '\D', '', 'g'), 10), '') = any(cts)
            or (u0.ci not like '%@%'
                and nullif(right(regexp_replace(coalesce(u0.ci, ''), '\D', '', 'g'), 10), '') = any(cts)), false) as pd
      from u0
  ), m as (
    select * from u
     where (p_paid is null or u.pd = p_paid)
       and (s is null or u.nm ilike '%' || s || '%' or u.ci ilike '%' || s || '%'
            or u.em ilike '%' || s || '%' or u.ph ilike '%' || s || '%')
  )
  select m.id, m.nm, coalesce(m.ci, m.em, m.ph), m.em, m.ph, m.ca, m.ls,
         (select count(*) from u), (select count(*) from m),
         m.pd, (select count(*) from u where u.pd)
    from m
   order by m.ca desc
   limit least(greatest(coalesce(p_limit, 50), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;
revoke all on function public.admin_list_users(text, integer, integer, boolean, uuid[], text[]) from public, anon;
grant execute on function public.admin_list_users(text, integer, integer, boolean, uuid[], text[]) to authenticated;
