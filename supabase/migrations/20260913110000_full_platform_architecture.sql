-- TakeOnTime full platform domains from the product architecture:
-- institutions, subscription meal plans, frozen financials, pickup verification,
-- wallet/settlements, staff roles, system configuration, audit logs, and refunds.

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check check (role in ('customer', 'vendor_owner', 'vendor_staff', 'admin', 'super_admin'));
alter table public.users add column if not exists institution_id uuid;
alter table public.users add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_institutions_name on public.institutions(lower(name));
alter table public.users add constraint users_institution_fk foreign key (institution_id) references public.institutions(id) on delete set null;

create table if not exists public.organization_vendor (
  institution_id uuid not null references public.institutions(id) on delete cascade,
  vendor_id text not null references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (institution_id, vendor_id)
);

alter table public.vendors add column if not exists venue_type text;
alter table public.vendors add column if not exists institution_id uuid references public.institutions(id) on delete set null;
alter table public.vendors add column if not exists gst_registered boolean not null default false;
alter table public.vendors add column if not exists gstin text;
alter table public.vendors add column if not exists bank_account_details jsonb;
alter table public.vendors add column if not exists status text not null default 'pending_approval';
update public.vendors set venue_type = coalesce(venue_type, business_type), status = case when is_approved then 'active' else 'pending_approval' end;

create index if not exists idx_vendor_institution on public.vendors(institution_id);
create index if not exists idx_org_vendor_vendor on public.organization_vendor(vendor_id);

alter table public.orders add column if not exists pickup_time timestamptz;
alter table public.orders add column if not exists payment_method text not null default 'razorpay';
alter table public.orders add column if not exists base_amount_paise integer not null default 0;
alter table public.orders add column if not exists gst_amount_paise integer not null default 0;
alter table public.orders add column if not exists platform_fee_amount_paise integer not null default 0;
alter table public.orders add column if not exists vendor_commission_amount_paise integer not null default 0;
alter table public.orders add column if not exists gateway_fee_amount_paise integer not null default 0;
alter table public.orders add column if not exists customer_paid_paise integer not null default 0;
alter table public.orders add column if not exists vendor_settlement_paise integer not null default 0;
alter table public.orders add column if not exists platform_revenue_paise integer not null default 0;
alter table public.orders add column if not exists pickup_otp_hash text;
alter table public.orders add column if not exists pickup_verified_at timestamptz;
alter table public.orders add column if not exists cancelled_at timestamptz;
update public.orders set base_amount_paise = subtotal_paise, customer_paid_paise = total_paise where base_amount_paise = 0;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check check (payment_method in ('razorpay', 'cod'));

create table if not exists public.order_status_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  actor_id uuid references public.users(id) on delete set null,
  changed_at timestamptz not null default now()
);
create index if not exists idx_order_status_log_order on public.order_status_log(order_id, changed_at);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  amount_paise integer not null check (amount_paise > 0),
  reason text,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  razorpay_refund_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete cascade,
  name text not null,
  description text not null default '',
  total_meals integer not null check (total_meals > 0),
  duration_days integer not null check (duration_days > 0),
  daily_limit integer not null check (daily_limit > 0),
  base_price_paise integer not null check (base_price_paise >= 0),
  meal_slots jsonb not null default '[]'::jsonb,
  no_show_policy jsonb not null default '{"action":"deduct","grace_minutes":30}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscription_plans_vendor on public.subscription_plans(vendor_id, is_active);

create table if not exists public.subscription_purchases (
  id uuid primary key default gen_random_uuid(),
  user_subscription_id uuid,
  vendor_id text not null references public.vendors(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  base_amount_paise integer not null,
  gst_amount_paise integer not null default 0,
  platform_fee_amount_paise integer not null default 0,
  vendor_commission_amount_paise integer not null default 0,
  gateway_fee_amount_paise integer not null default 0,
  customer_paid_paise integer not null,
  vendor_settlement_paise integer not null,
  platform_revenue_paise integer not null,
  razorpay_order_id text,
  razorpay_payment_id text unique,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'payment_failed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  total_meals integer not null,
  meals_remaining integer not null,
  meals_reserved integer not null default 0,
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (meals_remaining >= 0 and meals_reserved >= 0 and meals_remaining + meals_reserved <= total_meals)
);

alter table public.subscription_purchases
  add constraint subscription_purchases_subscription_fk foreign key (user_subscription_id) references public.user_subscriptions(id) on delete set null;
create index if not exists idx_user_subscriptions_user on public.user_subscriptions(user_id, status, end_date);

create table if not exists public.subscription_orders (
  id uuid primary key default gen_random_uuid(),
  user_subscription_id uuid not null references public.user_subscriptions(id) on delete restrict,
  customer_id uuid not null references public.users(id) on delete restrict,
  vendor_id text not null references public.vendors(id) on delete restrict,
  meal_slot text not null,
  meal_description text not null default '',
  scheduled_pickup_time timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'preparing', 'ready', 'collected', 'cancelled', 'no_show')),
  pickup_otp_hash text,
  pickup_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscription_orders_vendor on public.subscription_orders(vendor_id, scheduled_pickup_time);
create index if not exists idx_subscription_orders_customer on public.subscription_orders(customer_id, scheduled_pickup_time);

create table if not exists public.meal_reservations (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.user_subscriptions(id) on delete restrict,
  subscription_order_id uuid not null unique references public.subscription_orders(id) on delete cascade,
  meal_count integer not null default 1 check (meal_count > 0),
  status text not null default 'reserved' check (status in ('reserved', 'consumed', 'expired', 'no_show', 'cancelled')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscription_usage (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.user_subscriptions(id) on delete restrict,
  subscription_order_id uuid references public.subscription_orders(id) on delete set null,
  meal_count integer not null default 1,
  used_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete restrict,
  type text not null check (type in ('credit', 'debit')),
  amount_paise integer not null check (amount_paise > 0),
  reference_type text not null check (reference_type in ('order', 'subscription_purchase', 'refund', 'settlement_batch')),
  reference_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_wallet_vendor on public.wallet_transactions(vendor_id, created_at desc);

create table if not exists public.settlement_batches (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete restrict,
  total_amount_paise integer not null check (total_amount_paise >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.settlement_items (
  id uuid primary key default gen_random_uuid(),
  settlement_batch_id uuid not null references public.settlement_batches(id) on delete cascade,
  wallet_transaction_id uuid not null references public.wallet_transactions(id) on delete restrict,
  unique (settlement_batch_id, wallet_transaction_id)
);

create table if not exists public.system_config (
  key text primary key,
  value numeric not null check (value >= 0),
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.system_config(key, value) values
  ('platform_fee_pct', 2.0),
  ('vendor_commission_pct', 6.0),
  ('gst_default_rate', 5.0),
  ('booking_advance_hours', 3.0),
  ('order_cancellation_window_minutes', 2.0),
  ('meal_cancellation_window_hours', 1.0)
on conflict (key) do nothing;

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);

alter table public.institutions enable row level security;
alter table public.organization_vendor enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.subscription_orders enable row level security;
alter table public.meal_reservations enable row level security;
alter table public.subscription_usage enable row level security;
alter table public.order_status_log enable row level security;
alter table public.refunds enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.settlement_batches enable row level security;
alter table public.settlement_items enable row level security;
alter table public.system_config enable row level security;
alter table public.audit_logs enable row level security;

create policy institutions_active_select on public.institutions for select using (is_active or public.is_platform_admin());
create policy organization_vendor_select on public.organization_vendor for select using (exists (select 1 from public.institutions i where i.id = institution_id and i.is_active) or public.is_platform_admin());
create policy subscription_plans_public_select on public.subscription_plans for select using (is_active or exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));
create policy user_subscriptions_self_select on public.user_subscriptions for select using (user_id = auth.uid() or public.is_platform_admin());
create policy subscription_orders_customer_vendor_select on public.subscription_orders for select using (customer_id = auth.uid() or exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));
create policy meal_reservations_subscription_select on public.meal_reservations for select using (exists (select 1 from public.user_subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_platform_admin())));
create policy subscription_usage_subscription_select on public.subscription_usage for select using (exists (select 1 from public.user_subscriptions s where s.id = subscription_id and (s.user_id = auth.uid() or public.is_platform_admin())));
create policy order_status_log_order_select on public.order_status_log for select using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_platform_admin() or exists (select 1 from public.vendors v where v.id = o.vendor_id and v.owner_id = auth.uid()::text))));
create policy refunds_order_select on public.refunds for select using (exists (select 1 from public.orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_platform_admin() or exists (select 1 from public.vendors v where v.id = o.vendor_id and v.owner_id = auth.uid()::text))));
create policy wallet_vendor_select on public.wallet_transactions for select using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));
create policy settlements_vendor_select on public.settlement_batches for select using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));
create policy settlement_items_vendor_select on public.settlement_items for select using (exists (select 1 from public.settlement_batches b join public.vendors v on v.id = b.vendor_id where b.id = settlement_batch_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));
create policy system_config_admin_select on public.system_config for select using (public.is_platform_admin());
create policy audit_logs_admin_select on public.audit_logs for select using (public.is_platform_admin());

create or replace function public.log_order_status_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_log(order_id, status, actor_id) values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;
drop trigger if exists order_status_audit on public.orders;
create trigger order_status_audit after update of status on public.orders for each row execute procedure public.log_order_status_change();

create or replace function public.expire_vendor_breaks()
returns integer language plpgsql security definer set search_path = public as $$
declare affected integer;
begin
  update public.vendors set break_until = null, updated_at = now() where break_until is not null and break_until <= now();
  get diagnostics affected = row_count;
  return affected;
end;
$$;
