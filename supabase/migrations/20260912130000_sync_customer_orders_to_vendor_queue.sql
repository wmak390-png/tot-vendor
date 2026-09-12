create or replace function public.sync_vendor_order_from_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_customer text;
  v_item text;
  v_amount integer;
begin
  select * into v_order from public.orders where id = new.order_id;
  if not found then return new; end if;

  select coalesce(nullif(trim(u.full_name), ''), nullif(trim(u.email), ''), 'Customer')
    into v_customer
  from public.users u
  where u.id = v_order.customer_id;
  v_customer := coalesce(v_customer, 'Customer');

  select string_agg(concat(oi.quantity, ' x ', oi.name), ', ' order by oi.name),
         coalesce(sum(oi.quantity * oi.unit_price_paise), 0)::integer
    into v_item, v_amount
  from public.order_items oi
  where oi.order_id = new.order_id;

  insert into public.vendor_orders (
    id, vendor_id, customer, item, quantity, amount_paise, status, time, pickup, note, order_type
  ) values (
    new.order_id::text,
    v_order.vendor_id,
    v_customer,
    coalesce(v_item, 'Order items'),
    coalesce((select sum(oi.quantity)::integer from public.order_items oi where oi.order_id = new.order_id), 1),
    v_amount,
    'New',
    'Recently',
    'Pickup time not set',
    v_order.notes,
    'regular'
  )
  on conflict (id) do update set
    customer = excluded.customer,
    item = excluded.item,
    quantity = excluded.quantity,
    amount_paise = excluded.amount_paise,
    note = excluded.note,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_vendor_order_from_item on public.order_items;
create trigger sync_vendor_order_from_item
after insert on public.order_items
for each row execute procedure public.sync_vendor_order_from_item();

create or replace function public.sync_vendor_order_status_to_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_customer_status text;
begin
  begin
    v_order_id := old.id::uuid;
  exception when invalid_text_representation then
    return new;
  end;

  v_customer_status := case new.status
    when 'New' then 'confirmed'
    when 'Accepted' then 'confirmed'
    when 'Preparing' then 'preparing'
    when 'Ready' then 'ready'
    when 'Completed' then 'completed'
    when 'Cancelled' then 'cancelled'
    else null
  end;

  if v_customer_status is not null then
    update public.orders
    set status = v_customer_status, updated_at = now()
    where id = v_order_id;
  end if;
  return new;
end;
$$;

drop trigger if exists sync_vendor_order_status_to_customer on public.vendor_orders;
create trigger sync_vendor_order_status_to_customer
after update of status on public.vendor_orders
for each row execute procedure public.sync_vendor_order_status_to_customer();
