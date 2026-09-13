-- Confirm a captured subscription payment and create its entitlement exactly once.
create or replace function public.confirm_subscription_purchase(
  p_purchase_id uuid,
  p_payment_id text
)
returns public.user_subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  purchase public.subscription_purchases%rowtype;
  plan public.subscription_plans%rowtype;
  subscription public.user_subscriptions%rowtype;
  start_date date := current_date;
begin
  select * into purchase
    from public.subscription_purchases
   where id = p_purchase_id
   for update;
  if purchase.id is null then
    raise exception 'Subscription purchase not found' using errcode = 'P0002';
  end if;
  if purchase.status = 'confirmed' and purchase.user_subscription_id is not null then
    select * into subscription from public.user_subscriptions where id = purchase.user_subscription_id;
    return subscription;
  end if;
  if purchase.status <> 'pending_payment' then
    raise exception 'Subscription purchase is not awaiting payment' using errcode = 'P0001';
  end if;

  select * into plan from public.subscription_plans where id = purchase.plan_id;
  if plan.id is null then
    raise exception 'Subscription plan not found' using errcode = 'P0002';
  end if;

  insert into public.user_subscriptions (
    user_id, plan_id, total_meals, meals_remaining, start_date, end_date, status
  ) values (
    purchase.user_id,
    purchase.plan_id,
    plan.total_meals,
    plan.total_meals,
    start_date,
    start_date + (plan.duration_days - 1),
    'active'
  ) returning * into subscription;

  update public.subscription_purchases
     set status = 'confirmed',
         razorpay_payment_id = p_payment_id,
         user_subscription_id = subscription.id
   where id = purchase.id;

  return subscription;
end;
$$;

grant execute on function public.confirm_subscription_purchase(uuid, text) to service_role;
