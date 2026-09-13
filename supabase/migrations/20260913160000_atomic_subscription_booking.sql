-- Atomically reserve one subscription entitlement and create its booking records.
create or replace function public.book_subscription_meal(
  p_subscription_id uuid,
  p_user_id uuid,
  p_meal_slot text,
  p_pickup_time timestamptz
)
returns public.subscription_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription public.user_subscriptions%rowtype;
  plan public.subscription_plans%rowtype;
  selected_slot jsonb;
  daily_count integer;
  created_order public.subscription_orders%rowtype;
begin
  if p_pickup_time < now() + interval '3 hours' then
    raise exception 'Meal slots must be booked at least three hours in advance' using errcode = 'P0001';
  end if;

  select us.* into subscription
    from public.user_subscriptions us
   where us.id = p_subscription_id
     and us.user_id = p_user_id
   for update;
  if subscription.id is null then
    raise exception 'Subscription not found' using errcode = 'P0002';
  end if;
  if subscription.status <> 'active' or subscription.meals_remaining < 1 or subscription.end_date < p_pickup_time::date then
    raise exception 'Subscription is unavailable for this booking' using errcode = 'P0001';
  end if;

  select sp.* into plan from public.subscription_plans sp where sp.id = subscription.plan_id;
  if plan.id is null then
    raise exception 'Subscription plan not found' using errcode = 'P0002';
  end if;

  select slot into selected_slot
    from jsonb_array_elements(plan.meal_slots) slot
   where slot->>'slot' = p_meal_slot
   limit 1;
  if selected_slot is null then
    raise exception 'Meal slot is unavailable' using errcode = 'P0001';
  end if;

  select count(*)::integer into daily_count
    from public.subscription_orders so
   where so.user_subscription_id = subscription.id
     and so.scheduled_pickup_time >= date_trunc('day', p_pickup_time at time zone 'UTC') at time zone 'UTC'
     and so.scheduled_pickup_time < (date_trunc('day', p_pickup_time at time zone 'UTC') + interval '1 day') at time zone 'UTC'
     and so.status <> 'cancelled';
  if daily_count >= plan.daily_limit then
    raise exception 'Daily meal limit has been reached' using errcode = 'P0001';
  end if;

  insert into public.subscription_orders (
    user_subscription_id, customer_id, vendor_id, meal_slot, meal_description, scheduled_pickup_time, status
  ) values (
    subscription.id, p_user_id, plan.vendor_id, p_meal_slot, coalesce(selected_slot->>'description', ''), p_pickup_time, 'scheduled'
  ) returning * into created_order;

  insert into public.meal_reservations (subscription_id, subscription_order_id, meal_count, expires_at)
  values (subscription.id, created_order.id, 1, p_pickup_time + interval '1 hour');

  insert into public.subscription_usage (subscription_id, subscription_order_id, meal_count, used_date)
  values (subscription.id, created_order.id, 1, p_pickup_time::date);

  update public.user_subscriptions
     set meals_remaining = meals_remaining - 1,
         meals_reserved = meals_reserved + 1,
         updated_at = now()
   where id = subscription.id;

  return created_order;
end;
$$;

grant execute on function public.book_subscription_meal(uuid, uuid, text, timestamptz) to service_role;
