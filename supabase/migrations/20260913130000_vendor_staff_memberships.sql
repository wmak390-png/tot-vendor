-- Persist vendor staff membership and role assignments.
create table if not exists public.vendor_staff_memberships (
  id uuid primary key default gen_random_uuid(),
  vendor_id text not null references public.vendors(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('manager', 'kitchen', 'kds_operator', 'dispatcher', 'waiter', 'finance')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, user_id)
);

create index if not exists idx_vendor_staff_vendor on public.vendor_staff_memberships(vendor_id, is_active);
create index if not exists idx_vendor_staff_user on public.vendor_staff_memberships(user_id, is_active);

alter table public.vendor_staff_memberships enable row level security;

create policy vendor_staff_select on public.vendor_staff_memberships
for select using (
  user_id = auth.uid()
  or exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.owner_id = auth.uid()::text
  )
  or public.is_platform_admin()
);

create policy vendor_staff_owner_insert on public.vendor_staff_memberships
for insert with check (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.owner_id = auth.uid()::text
  )
  or public.is_platform_admin()
);

create policy vendor_staff_owner_update on public.vendor_staff_memberships
for update using (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.owner_id = auth.uid()::text
  )
  or public.is_platform_admin()
) with check (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.owner_id = auth.uid()::text
  )
  or public.is_platform_admin()
);

create policy vendor_staff_owner_delete on public.vendor_staff_memberships
for delete using (
  exists (
    select 1 from public.vendors v
    where v.id = vendor_id and v.owner_id = auth.uid()::text
  )
  or public.is_platform_admin()
);
