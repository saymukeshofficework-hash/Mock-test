-- Daily current affairs push alerts (Web Push).
-- Secrets live only in Supabase Vault (names: ca_push_vapid_private, ca_push_trigger_key), never in this repo.
create extension if not exists pg_net;
create extension if not exists pg_cron;

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
  -- The 08:00 IST cron sends the normal daily alert. If today's content is
  -- published later, send it on save instead; ca_push_log prevents duplicates.
  if new.day = (now() at time zone 'Asia/Kolkata')::date
     and (now() at time zone 'Asia/Kolkata')::time >= time '08:00' then
    perform net.http_post(
      url := 'https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/ca-push',
      body := jsonb_build_object('action', 'daily', 'day', new.day),
      headers := jsonb_build_object('Content-Type', 'application/json',
        'x-push-key', (select decrypted_secret from vault.decrypted_secrets where name = 'ca_push_trigger_key'))
    );
  end if;
  return new;
exception when others then
  return new; -- never block saving current affairs
end;
$$;
revoke all on function public.ca_days_push_notify() from public, anon, authenticated;

drop trigger if exists ca_days_push_notify on public.ca_days;
create trigger ca_days_push_notify after insert or update on public.ca_days
  for each row execute function public.ca_days_push_notify();


-- Send the daily Current Affairs alert at 08:00 India time, but only when
-- today's content has been published. A later content update is handled by
-- the guarded table trigger above.
select cron.unschedule(jobid)
from cron.job
where jobname = 'tth-daily-current-affairs-push';

select cron.schedule(
  'tth-daily-current-affairs-push',
  '30 2 * * *',
  $job$
    select net.http_post(
      url := 'https://znulepzdihzhjmuvyroi.supabase.co/functions/v1/ca-push',
      body := jsonb_build_object('action', 'daily', 'day', (now() at time zone 'Asia/Kolkata')::date),
      headers := jsonb_build_object('Content-Type', 'application/json',
        'x-push-key', (select decrypted_secret from vault.decrypted_secrets where name = 'ca_push_trigger_key'))
    )
    where exists (
      select 1 from public.ca_days
      where day = (now() at time zone 'Asia/Kolkata')::date
    );
  $job$
);
