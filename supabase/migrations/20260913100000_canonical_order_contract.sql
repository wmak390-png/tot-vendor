-- Align order/payment persistence with the documented state machine.
-- The legacy vendor_orders table remains for backwards compatibility, but orders is canonical.

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check check (status in (
    'pending_payment', 'confirmed', 'accepted', 'preparing', 'ready',
    'completed', 'rejected', 'payment_failed', 'cancelled'
  ));

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  razorpay_payment_id text unique,
  amount_paise integer not null check (amount_paise >= 0),
  status text not null check (status in ('captured', 'failed', 'refunded')),
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_orders_status on public.orders(status, created_at desc);
create index if not exists idx_orders_updated_at on public.orders(updated_at desc);

create or replace function public.prevent_illegal_order_transition()
returns trigger
language plpgsql
as $$
begin
  if old.status = new.status then
    new.updated_at = now();
    return new;
  end if;

  if not (
    (old.status = 'pending_payment' and new.status in ('confirmed', 'payment_failed')) or
    (old.status = 'confirmed' and new.status in ('accepted', 'rejected', 'cancelled')) or
    (old.status = 'accepted' and new.status in ('preparing', 'cancelled')) or
    (old.status = 'preparing' and new.status in ('ready', 'cancelled')) or
    (old.status = 'ready' and new.status in ('completed', 'cancelled'))
  ) then
    raise exception 'Illegal order transition: % -> %', old.status, new.status
      using errcode = 'check_violation';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists order_status_transition on public.orders;
create trigger order_status_transition
before update of status on public.orders
for each row execute procedure public.prevent_illegal_order_transition();

alter table public.payments enable row level security;

drop policy if exists payments_customer_or_vendor_select on public.payments;
create policy payments_customer_or_vendor_select on public.payments
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_id
      and (
        o.customer_id = auth.uid()
        or exists (select 1 from public.vendors v where v.id = o.vendor_id and v.owner_id = auth.uid()::text)
        or public.is_platform_admin()
      )
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'payments'
  ) then
    alter publication supabase_realtime add table public.payments;
  end if;
end;
$$;
