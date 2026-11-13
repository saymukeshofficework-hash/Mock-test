-- Daily current affairs push alerts (Web Push).
-- Secrets live only in Supabase Vault (names: ca_push_vapid_private, ca_push_trigger_key), never in this repo.
create extension if not exists pg_net;

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  p256dh text not null,
  auth text not null,
  lang text not null default 'hi',
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security; -- no policies: only the ca-push function (service role) reads/writes

create table if not exists public.ca_push_log (
  day date primary key,
  sent_at timestamptz not null default now(),
  sent int not null default 0,
  failed int not null default 0
);
alter table public.ca_push_log enable row level security;

-- Lets the ca-push function (service role only) read its two Vault secrets.
create or replace function public.ca_push_secret(secret_name text)
returns text language sql security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets
  where name = secret_name and secret_name in ('ca_push_vapid_private', 'ca_push_trigger_key');
$$;
revoke all on function public.ca_push_secret(text) from public, anon, authenticated;
grant execute on function public.ca_push_secret(text) to service_role;

-- When a day's current affairs row is saved, ask ca-push to send the alert (it sends once per day, only for today).
create or replace function public.ca_days_push_notify()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform net.http_post(
    url := 'https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/ca-push',
    body := jsonb_build_object('action', 'daily', 'day', new.day),
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-push-key', (select decrypted_secret from vault.decrypted_secrets where name = 'ca_push_trigger_key'))
  );
  return new;
exception when others then
  return new; -- never block saving current affairs
end;
$$;
revoke all on function public.ca_days_push_notify() from public, anon, authenticated;

drop trigger if exists ca_days_push_notify on public.ca_days;
create trigger ca_days_push_notify after insert or update on public.ca_days
  for each row execute function public.ca_days_push_notify();
