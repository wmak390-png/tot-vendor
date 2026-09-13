-- Atomically cancel a reserved subscription meal and restore its entitlement.
create or replace function public.cancel_meal_reservation(
  p_reservation_id uuid,
  p_user_id uuid
)
returns public.meal_reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation public.meal_reservations%rowtype;
  subscription public.user_subscriptions%rowtype;
begin
  select mr.*
    into reservation
    from public.meal_reservations mr
    join public.user_subscriptions us on us.id = mr.subscription_id
   where mr.id = p_reservation_id
     and us.user_id = p_user_id
   for update;

  if reservation.id is null then
    raise exception 'Reservation not found' using errcode = 'P0002';
  end if;
  if reservation.status <> 'reserved' then
    raise exception 'Reservation is no longer cancellable' using errcode = 'P0001';
  end if;
  if reservation.expires_at <= now() then
    raise exception 'Reservation cancellation window has expired' using errcode = 'P0001';
  end if;

  select * into subscription
    from public.user_subscriptions
   where id = reservation.subscription_id
   for update;

  update public.user_subscriptions
     set meals_remaining = meals_remaining + reservation.meal_count,
         meals_reserved = greatest(0, meals_reserved - reservation.meal_count),
         updated_at = now()
   where id = subscription.id;

  update public.meal_reservations
     set status = 'cancelled'
   where id = reservation.id;

  update public.subscription_orders
     set status = 'cancelled', updated_at = now()
   where id = reservation.subscription_order_id;

  delete from public.subscription_usage
   where subscription_order_id = reservation.subscription_order_id;

  select * into reservation from public.meal_reservations where id = reservation.id;
  return reservation;
end;
$$;

grant execute on function public.cancel_meal_reservation(uuid, uuid) to service_role;
