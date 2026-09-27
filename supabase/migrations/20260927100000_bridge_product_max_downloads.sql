-- Download limit per purchase now lives on the product row (set to 2 on 27 Sep 2026),
-- so it can be changed with one UPDATE and no Edge Function redeploy. Applied to the
-- live project as migration "bridge_product_max_downloads".
alter table public.products add column if not exists max_downloads integer not null default 2 check (max_downloads >= 0);
update public.products set max_downloads = 2 where slug = 'bridge-course-notes';

create or replace function public.bridge_fulfil_order(
  p_order_id uuid, p_razorpay_payment_id text, p_razorpay_signature text,
  p_amount_paise integer, p_currency text, p_payment_status text, p_method text,
  p_email text, p_phone text, p_max_downloads integer, p_access_days integer)
returns table (purchase_id uuid, newly_fulfilled boolean)
language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders%rowtype;
  v_purchase_id uuid;
  v_max integer;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if p_amount_paise <> v_order.amount_paise or p_currency <> v_order.currency then
    raise exception 'amount_mismatch';
  end if;
  if v_order.status in ('refunded', 'cancelled') then raise exception 'order_not_payable'; end if;

  insert into public.payments (order_id, razorpay_payment_id, razorpay_order_id,
    razorpay_signature, amount_paise, currency, status, method, email, phone)
  values (p_order_id, p_razorpay_payment_id, v_order.razorpay_order_id,
    p_razorpay_signature, p_amount_paise, p_currency, p_payment_status, p_method, p_email, p_phone)
  on conflict (razorpay_payment_id) do update
    set status = excluded.status,
        razorpay_signature = coalesce(public.payments.razorpay_signature, excluded.razorpay_signature);

  select id into v_purchase_id from public.purchases where order_id = p_order_id;
  if v_purchase_id is not null then
    if v_order.status <> 'paid' then update public.orders set status = 'paid' where id = p_order_id; end if;
    return query select v_purchase_id, false;
    return;
  end if;

  update public.orders set status = 'paid' where id = p_order_id;
  select coalesce(p.max_downloads, p_max_downloads) into v_max from public.products p where p.id = v_order.product_id;

  insert into public.purchases (order_id, product_id, buyer_name, buyer_email, buyer_phone, max_downloads, expires_at)
  values (p_order_id, v_order.product_id, v_order.buyer_name, v_order.buyer_email, v_order.buyer_phone,
    v_max, now() + make_interval(days => p_access_days))
  returning id into v_purchase_id;

  return query select v_purchase_id, true;
end;
$$;
revoke all on function public.bridge_fulfil_order(uuid, text, text, integer, text, text, text, text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.bridge_fulfil_order(uuid, text, text, integer, text, text, text, text, text, integer, integer) to service_role;
