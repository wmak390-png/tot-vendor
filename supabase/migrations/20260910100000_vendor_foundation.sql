create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role text not null default 'customer' check (role in ('customer', 'vendor_owner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id text primary key,
  owner_id text not null,
  business_name text not null,
  business_type text not null,
  merchant_id text not null default '',
  logo_url text,
  accepting_orders boolean not null default false,
  break_until timestamptz,
  is_approved boolean not null default false,
  approval_note text,
  address text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendor_categories (
  id text primary key,
  vendor_id text not null references public.vendors(id) on delete cascade,
  name text not null,
  accent text not null default 'layers',
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.vendor_items (
  id text primary key,
  vendor_id text not null references public.vendors(id) on delete cascade,
  category_id text not null references public.vendor_categories(id) on delete cascade,
  name text not null,
  description text not null default '',
  price_paise integer not null check (price_paise >= 0),
  prep_minutes integer not null default 10 check (prep_minutes > 0),
  is_available boolean not null default true,
  image_url text
);

create table if not exists public.vendor_orders (
  id text primary key,
  vendor_id text not null references public.vendors(id) on delete restrict,
  customer text not null,
  item text not null,
  quantity integer not null default 1 check (quantity > 0),
  amount_paise integer not null check (amount_paise >= 0),
  status text not null default 'New' check (status in ('New', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
  time text not null default 'Recently',
  pickup text not null default 'Pickup time not set',
  note text,
  order_type text not null default 'regular',
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete restrict,
  customer_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  subtotal_paise integer not null check (subtotal_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  razorpay_order_id text,
  razorpay_payment_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id text not null references public.vendor_items(id) on delete restrict,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_paise integer not null check (unit_price_paise >= 0)
);

create index if not exists idx_vendors_approved on public.vendors(is_approved);
create index if not exists idx_vendor_categories_vendor on public.vendor_categories(vendor_id, sort_order);
create index if not exists idx_vendor_items_vendor on public.vendor_items(vendor_id);
create index if not exists idx_vendor_items_category on public.vendor_items(category_id);
create index if not exists idx_vendor_orders_vendor on public.vendor_orders(vendor_id, updated_at desc);
create index if not exists idx_vendor_orders_status on public.vendor_orders(status);
create index if not exists idx_orders_customer on public.orders(customer_id, created_at desc);
create index if not exists idx_orders_vendor on public.orders(vendor_id, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

create or replace function public.prevent_illegal_vendor_order_transition()
returns trigger
language plpgsql
as $$
begin
  if old.status = new.status then return new; end if;
  if not (
    (old.status = 'New' and new.status in ('Accepted', 'Cancelled')) or
    (old.status = 'Accepted' and new.status in ('Preparing', 'Cancelled')) or
    (old.status = 'Preparing' and new.status in ('Ready', 'Cancelled')) or
    (old.status = 'Ready' and new.status = 'Completed')
  ) then
    raise exception 'Illegal vendor order transition: % -> %', old.status, new.status using errcode = 'check_violation';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendor_order_status_transition on public.vendor_orders;
create trigger vendor_order_status_transition
before update of status on public.vendor_orders
for each row execute procedure public.prevent_illegal_vendor_order_transition();

alter table public.users enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_categories enable row level security;
alter table public.vendor_items enable row level security;
alter table public.vendor_orders enable row level security;

drop policy if exists users_self_or_admin_select on public.users;
create policy users_self_or_admin_select on public.users
for select using (id = auth.uid() or public.is_platform_admin());

drop policy if exists vendors_public_or_owner_select on public.vendors;
create policy vendors_public_or_owner_select on public.vendors
for select using (is_approved or owner_id = auth.uid()::text or public.is_platform_admin());

drop policy if exists vendors_owner_insert on public.vendors;
create policy vendors_owner_insert on public.vendors
for insert with check (owner_id = auth.uid()::text or public.is_platform_admin());

drop policy if exists vendors_owner_update on public.vendors;
create policy vendors_owner_update on public.vendors
for update using (owner_id = auth.uid()::text or public.is_platform_admin())
with check (owner_id = auth.uid()::text or public.is_platform_admin());

drop policy if exists vendor_categories_public_select on public.vendor_categories;
create policy vendor_categories_public_select on public.vendor_categories
for select using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.is_approved or v.owner_id = auth.uid()::text or public.is_platform_admin())));

drop policy if exists vendor_categories_owner_manage on public.vendor_categories;
create policy vendor_categories_owner_manage on public.vendor_categories
for all using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())))
with check (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));

drop policy if exists vendor_items_public_select on public.vendor_items;
create policy vendor_items_public_select on public.vendor_items
for select using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.is_approved or v.owner_id = auth.uid()::text or public.is_platform_admin())));

drop policy if exists vendor_items_owner_manage on public.vendor_items;
create policy vendor_items_owner_manage on public.vendor_items
for all using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())))
with check (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));

drop policy if exists vendor_orders_owner_or_admin_select on public.vendor_orders;
create policy vendor_orders_owner_or_admin_select on public.vendor_orders
for select using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));

drop policy if exists vendor_orders_owner_or_admin_update on public.vendor_orders;
create policy vendor_orders_owner_or_admin_update on public.vendor_orders
for update using (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())))
with check (exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin())));

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists orders_customer_vendor_admin_select on public.orders;
create policy orders_customer_vendor_admin_select on public.orders
for select using (
  customer_id = auth.uid()
  or exists (select 1 from public.vendors v where v.id = vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin()))
  or public.is_platform_admin()
);

drop policy if exists order_items_customer_vendor_admin_select on public.order_items;
create policy order_items_customer_vendor_admin_select on public.order_items
for select using (exists (select 1 from public.orders o where o.id = order_id and (
  o.customer_id = auth.uid()
  or exists (select 1 from public.vendors v where v.id = o.vendor_id and (v.owner_id = auth.uid()::text or public.is_platform_admin()))
  or public.is_platform_admin()
)));

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vendors'
  ) then alter publication supabase_realtime add table public.vendors; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vendor_items'
  ) then alter publication supabase_realtime add table public.vendor_items; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'vendor_orders'
  ) then alter publication supabase_realtime add table public.vendor_orders; end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then alter publication supabase_realtime add table public.orders; end if;
end;
$$;
