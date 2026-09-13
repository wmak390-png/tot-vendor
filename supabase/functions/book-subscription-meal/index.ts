import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const authorization = request.headers.get('Authorization');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Function configuration is incomplete' }, 500);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);
  const body = await request.json().catch(() => null);
  const subscriptionId = typeof body?.subscriptionId === 'string' ? body.subscriptionId : '';
  const mealSlot = typeof body?.mealSlot === 'string' ? body.mealSlot : '';
  const pickupTime = typeof body?.pickupTime === 'string' ? new Date(body.pickupTime) : null;
  if (!subscriptionId || !mealSlot || !pickupTime || Number.isNaN(pickupTime.getTime())) return json({ error: 'subscriptionId, mealSlot, and pickupTime are required' }, 400);
  if (pickupTime.getTime() - Date.now() < 3 * 60 * 60 * 1000) return json({ error: { code: 'BOOKING_ADVANCE_RULE', message: 'Meal slots must be booked at least three hours in advance.' } }, 409);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: subscription, error: subscriptionError } = await adminClient
    .from('user_subscriptions')
    .select('id, user_id, plan_id, meals_remaining, meals_reserved, end_date, status, subscription_plans(vendor_id, name, meal_slots, daily_limit)')
    .eq('id', subscriptionId)
    .maybeSingle();
  if (subscriptionError) return json({ error: subscriptionError.message }, 500);
  if (!subscription || subscription.user_id !== userData.user.id) return json({ error: 'Subscription not found' }, 404);
  if (subscription.status !== 'active' || subscription.meals_remaining < 1 || new Date(`${subscription.end_date}T23:59:59Z`) < pickupTime) return json({ error: { code: 'SUBSCRIPTION_UNAVAILABLE', message: 'This meal plan cannot be used for that booking.' } }, 409);

  const plan = subscription.subscription_plans as unknown as Record<string, unknown> | null;
  if (!plan) return json({ error: { code: 'PLAN_DATA_MISSING', message: 'This subscription plan is missing required data.' } }, 409);

  const startOfDay = new Date(pickupTime);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const { count: dailyCount } = await adminClient.from('subscription_orders').select('id', { count: 'exact', head: true }).eq('user_subscription_id', subscription.id).gte('scheduled_pickup_time', startOfDay.toISOString()).lt('scheduled_pickup_time', endOfDay.toISOString()).neq('status', 'cancelled');
  if ((dailyCount ?? 0) >= Number(plan.daily_limit ?? 1)) return json({ error: { code: 'DAILY_LIMIT_REACHED', message: 'Your plan daily meal limit has been reached.' } }, 409);

  const slots = Array.isArray(plan.meal_slots) ? plan.meal_slots as Array<Record<string, unknown>> : [];
  const selectedSlot = slots.find((slot) => slot.slot === mealSlot);
  if (!selectedSlot) return json({ error: { code: 'MEAL_SLOT_UNAVAILABLE', message: 'That meal slot is not available.' } }, 409);

  const { data: subscriptionOrder, error: insertError } = await adminClient.from('subscription_orders').insert({
    user_subscription_id: subscription.id,
    customer_id: userData.user.id,
    vendor_id: plan.vendor_id,
    meal_slot: mealSlot,
    meal_description: String(selectedSlot.description ?? ''),
    scheduled_pickup_time: pickupTime.toISOString(),
    status: 'scheduled',
  }).select().single();
  if (insertError) return json({ error: insertError.message }, 409);

  const { error: reservationError } = await adminClient.from('meal_reservations').insert({
    subscription_id: subscription.id,
    subscription_order_id: subscriptionOrder.id,
    meal_count: 1,
    expires_at: new Date(pickupTime.getTime() + 60 * 60 * 1000).toISOString(),
  });
  if (reservationError) return json({ error: reservationError.message }, 409);

  const { error: usageError } = await adminClient.from('subscription_usage').insert({
    subscription_id: subscription.id,
    subscription_order_id: subscriptionOrder.id,
    meal_count: 1,
    used_date: pickupTime.toISOString().slice(0, 10),
  });
  if (usageError) return json({ error: usageError.message }, 409);

  await adminClient.from('user_subscriptions').update({ meals_remaining: subscription.meals_remaining - 1, meals_reserved: subscription.meals_reserved + 1 }).eq('id', subscription.id);
  try {
    await adminClient.from('audit_logs').insert({
      actor_id: userData.user.id,
      action: 'book_subscription_meal',
      target_table: 'subscription_orders',
      target_id: subscriptionOrder.id,
      metadata: { subscription_id: subscription.id, meal_slot: mealSlot, pickup_time: pickupTime.toISOString() },
    });
  } catch {
    // Best-effort event tracking only.
  }
  return json(subscriptionOrder, 201);
});
