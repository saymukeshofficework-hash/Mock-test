-- TET Test Hub: enable self-registration and automatic student profiles.
-- Run this once in Supabase SQL Editor.
-- This keeps package/purchases controlled by the database and gives every new
-- auth user a unique Student ID automatically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_student_id text;
begin
  new_student_id := 'TET' || to_char(now(), 'YY') || upper(substr(replace(new.id::text,'-',''),1,8));

  insert into public.profiles (id, student_id, full_name, package, purchased_tests, status)
  values (
    new.id,
    new_student_id,
    coalesce(new.raw_user_meta_data->>'full_name',''),
    '',
    '{}',
    'active'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Make sure the authenticated user can read only their own automatically-created profile.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (id = auth.uid());

