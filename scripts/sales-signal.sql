-- Sales signal for the 6-hourly bug check (Supabase project exam-hub, ref znulepzdihzhjmuvyroi).
-- Run read-only via the Supabase MCP execute_sql tool. Prints counts only, no buyer emails/phones.
-- Real-money orders only (amount > 0, in paise); free unlocks are stored as paid with amount 0.
-- unpaid = Unlock/Buy clicked and a Razorpay order made, but no payment completed.
-- flag = 'HIGH' when 5+ orders were left unpaid in 24 h and they are more than 3x the paid ones
-- (people try to pay but fail or give up: check the Razorpay checkout and Unlock buttons).
with o as (select * from orders where amount > 0 and created_at > now() - interval '24 hours')
select
  count(*) filter (where status = 'created')                     as unpaid_orders_24h,
  count(*) filter (where status = 'paid')                        as paid_orders_24h,
  coalesce(sum(amount) filter (where status = 'paid'), 0) / 100  as paid_rupees_24h,
  case when count(*) filter (where status = 'created') >= 5
        and count(*) filter (where status = 'created') > 3 * count(*) filter (where status = 'paid')
       then 'HIGH' else 'ok' end                                 as flag
from o;
