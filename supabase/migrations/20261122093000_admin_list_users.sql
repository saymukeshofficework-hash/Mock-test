-- Admin "Users" menu (examhelp /admin): total registered users + paginated, searchable list.
-- Only admins (public.bridge_admins, checked by is_bridge_admin()) can call it. SECURITY DEFINER
-- reads auth.users on the server; the browser only sends the admin's own sign-in token.
create or replace function public.admin_list_users(
  p_search text default null, p_limit integer default 50, p_offset integer default 0)
returns table (
  user_id uuid, full_name text, contact text, email text, phone text,
  created_at timestamptz, last_sign_in_at timestamptz, total_users bigint, matched_users bigint)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s text := nullif(trim(coalesce(p_search, '')), '');
begin
  if not public.is_bridge_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  with u as (
    select a.id,
           coalesce(a.raw_user_meta_data->>'full_name', a.raw_user_meta_data->>'name') as nm,
           a.raw_user_meta_data->>'contact_identifier' as ci,
           a.email::text as em, a.phone::text as ph, a.created_at as ca, a.last_sign_in_at as ls
      from auth.users a
     where a.deleted_at is null
  ), m as (
    select * from u
     where s is null or u.nm ilike '%' || s || '%' or u.ci ilike '%' || s || '%'
        or u.em ilike '%' || s || '%' or u.ph ilike '%' || s || '%'
  )
  select m.id, m.nm, coalesce(m.ci, m.em, m.ph), m.em, m.ph, m.ca, m.ls,
         (select count(*) from u), (select count(*) from m)
    from m
   order by m.ca desc
   limit least(greatest(coalesce(p_limit, 50), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;
revoke all on function public.admin_list_users(text, integer, integer) from public, anon;
grant execute on function public.admin_list_users(text, integer, integer) to authenticated;
