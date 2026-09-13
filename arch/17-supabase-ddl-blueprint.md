# 17 — Supabase DDL Blueprint

This is the structural blueprint for production migrations. Exact enum names may be adapted during implementation, but the invariants are normative.

## 17.1 Extensions

```sql
create extension if not exists pgcrypto;
create extension if not exists citext;
```

Use `gen_random_uuid()` for UUID generation.

## 17.2 Timestamp trigger

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

Attach it to every mutable table with `updated_at`.

## 17.3 Core identity

```sql
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email citext,
  phone text,
  role text not null default 'customer',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Role transitions are privileged.

## 17.4 Vendor core

```sql
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id),
  facility_id uuid,
  business_name text not null,
  business_type text not null,
  merchant_id text,
  approval_status text not null default 'pending',
  approval_note text,
  accepting_orders boolean not null default false,
  break_until timestamptz,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 17.5 Menu

```sql
create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  category_id uuid not null references public.menu_categories(id) on delete cascade,
  name text not null,
  description text,
  price_paise integer not null check (price_paise >= 0),
  prep_minutes integer not null default 10 check (prep_minutes > 0),
  image_path text,
  is_available boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Use a trigger/function to prevent `menu_items.vendor_id` from differing from its category's vendor.

## 17.6 Orders

```sql
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id),
  vendor_id uuid not null references public.vendors(id),
  status text not null default 'pending_payment',
  subtotal_paise integer not null check (subtotal_paise >= 0),
  tax_paise integer not null default 0 check (tax_paise >= 0),
  service_fee_paise integer not null default 0 check (service_fee_paise >= 0),
  discount_paise integer not null default 0 check (discount_paise >= 0),
  total_paise integer not null check (total_paise >= 0),
  currency text not null default 'INR',
  provider_order_id text,
  provider_payment_id text,
  payment_status text not null default 'pending',
  pickup_slot_id uuid,
  notes text,
  pickup_otp_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Never accept `total_paise` from the client as authoritative.

## 17.7 Order items and history

```sql
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id),
  item_name_snapshot text not null,
  unit_price_paise integer not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  customization_jsonb jsonb not null default '{}'::jsonb
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_id uuid references public.users(id),
  actor_type text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## 17.8 Payments and provider events

```sql
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  provider text not null,
  provider_order_id text,
  provider_payment_id text,
  amount_paise integer not null check (amount_paise >= 0),
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index uq_payments_provider_payment
  on public.payments(provider, provider_payment_id)
  where provider_payment_id is not null;

create table public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);
```

## 17.9 Reservation capacity

Concrete service slots are preferable for high-throughput booking:

```sql
create table public.meal_slots (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id),
  branch_id uuid,
  service_date date not null,
  meal text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  booked integer not null default 0 check (booked >= 0 and booked <= capacity),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Capacity must be changed inside a transaction that locks the slot row.

## 17.10 RLS enablement

Every browser-accessible application table should have:

```sql
alter table public.orders enable row level security;
```

Then create narrowly scoped policies rather than broad `authenticated` CRUD policies.

## 17.11 Production migration rules

- one logical concern per migration.
- no destructive production change without expand/contract.
- every migration tested against staging.
- RLS policies versioned with schema.
- seed data separated from migrations.
