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
  const planId = typeof body?.planId === 'string' ? body.planId : '';
  const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (!planId || !idempotencyKey) return json({ error: 'planId and idempotencyKey are required' }, 400);

  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!razorpayKeyId || !razorpayKeySecret) return json({ error: { code: 'PAYMENT_CONFIGURATION_MISSING', message: 'Online payment is not configured for this environment.' } }, 503);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: plan, error: planError } = await adminClient
    .from('subscription_plans')
    .select('id, vendor_id, name, total_meals, duration_days, base_price_paise, is_active')
    .eq('id', planId)
    .eq('is_active', true)
    .maybeSingle();
  if (planError) return json({ error: planError.message }, 500);
  if (!plan) return json({ error: { code: 'PLAN_UNAVAILABLE', message: 'This meal plan is no longer available.' } }, 409);

  const { data: existing } = await adminClient
    .from('subscription_purchases')
    .select('id, plan_id, customer_paid_paise, razorpay_order_id, status')
    .eq('user_id', userData.user.id)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (existing?.razorpay_order_id) return json({ ...existing, razorpay_key_id: razorpayKeyId });
  if (existing) return json({ error: { code: 'PAYMENT_ORDER_PENDING', message: 'This purchase is already being prepared.' } }, 409);

  const { data: configRows } = await adminClient.from('system_config').select('key, value').in('key', ['platform_fee_pct', 'vendor_commission_pct', 'gst_default_rate']);
  const config = Object.fromEntries((configRows ?? []).map((row) => [row.key, Number(row.value)]));
  const baseAmount = Number(plan.base_price_paise);
  const gstAmount = Math.round(baseAmount * (config.gst_default_rate ?? 5) / 100);
  const platformFeeAmount = Math.round(baseAmount * (config.platform_fee_pct ?? 2) / 100);
  const vendorCommissionAmount = Math.round(baseAmount * (config.vendor_commission_pct ?? 6) / 100);
  const customerPaid = baseAmount + gstAmount + platformFeeAmount;
  const vendorSettlement = baseAmount - vendorCommissionAmount;
  const platformRevenue = platformFeeAmount + vendorCommissionAmount;

  const { data: purchase, error: purchaseError } = await adminClient.from('subscription_purchases').insert({
    user_id: userData.user.id,
    vendor_id: plan.vendor_id,
    plan_id: plan.id,
    idempotency_key: idempotencyKey,
    base_amount_paise: baseAmount,
    gst_amount_paise: gstAmount,
    platform_fee_amount_paise: platformFeeAmount,
    vendor_commission_amount_paise: vendorCommissionAmount,
    gateway_fee_amount_paise: 0,
    customer_paid_paise: customerPaid,
    vendor_settlement_paise: vendorSettlement,
    platform_revenue_paise: platformRevenue,
    status: 'pending_payment',
  }).select().single();
  if (purchaseError) return json({ error: purchaseError.message, code: purchaseError.code }, purchaseError.code === '23505' ? 409 : 400);

  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount: customerPaid, currency: 'INR', receipt: String(purchase.id), payment_capture: 1 }),
  });
  if (!razorpayResponse.ok) {
    await adminClient.from('subscription_purchases').update({ status: 'payment_failed' }).eq('id', purchase.id);
    return json({ error: { code: 'PAYMENT_ORDER_CREATE_FAILED', message: 'Unable to start online payment.' } }, 502);
  }

  const razorpayOrder = await razorpayResponse.json();
  const { data: updatedPurchase, error: updateError } = await adminClient
    .from('subscription_purchases')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('id', purchase.id)
    .select()
    .single();
  if (updateError) return json({ error: updateError.message }, 500);
  return json({ ...updatedPurchase, plan_name: plan.name, total_meals: plan.total_meals, duration_days: plan.duration_days, razorpay_key_id: razorpayKeyId }, 201);
});
