-- Admin page "Cancel access" sets status = 'cancelled'.
alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check check (status = any (array['created'::text, 'paid'::text, 'failed'::text, 'cancelled'::text]));
