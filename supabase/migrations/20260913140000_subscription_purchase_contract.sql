-- Complete the subscription purchase boundary used by the payment edge function.
alter table public.subscription_purchases
  add column if not exists idempotency_key text;

create unique index if not exists idx_subscription_purchases_customer_idempotency
  on public.subscription_purchases(user_id, idempotency_key)
  where idempotency_key is not null;

create unique index if not exists idx_subscription_purchases_razorpay_order
  on public.subscription_purchases(razorpay_order_id)
  where razorpay_order_id is not null;

alter table public.subscription_purchases enable row level security;

create policy subscription_purchases_customer_select on public.subscription_purchases
for select using (user_id = auth.uid() or public.is_platform_admin());

create policy subscription_purchases_customer_insert on public.subscription_purchases
for insert with check (user_id = auth.uid() or public.is_platform_admin());
