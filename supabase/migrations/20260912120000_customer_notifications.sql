create table if not exists public.customer_notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  order_id uuid unique references public.orders(id) on delete cascade,
  title text not null,
  body text not null,
  notification_type text not null default 'order',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.customer_notifications
  add column if not exists order_id uuid references public.orders(id) on delete cascade;

create unique index if not exists idx_customer_notifications_order
  on public.customer_notifications(order_id)
  where order_id is not null;

create index if not exists idx_customer_notifications_customer
  on public.customer_notifications(customer_id, created_at desc);

alter table public.customer_notifications enable row level security;

drop policy if exists customer_notifications_self_select on public.customer_notifications;
create policy customer_notifications_self_select on public.customer_notifications
for select using (customer_id = auth.uid());

drop policy if exists customer_notifications_self_update on public.customer_notifications;
create policy customer_notifications_self_update on public.customer_notifications
for update using (customer_id = auth.uid())
with check (customer_id = auth.uid());

drop policy if exists customer_notifications_self_delete on public.customer_notifications;
create policy customer_notifications_self_delete on public.customer_notifications
for delete using (customer_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'customer_notifications'
  ) then
    alter publication supabase_realtime add table public.customer_notifications;
  end if;
end;
$$;
