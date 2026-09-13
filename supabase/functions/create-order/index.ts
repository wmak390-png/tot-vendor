import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ error: 'Authorization required' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json({ error: 'Function configuration is incomplete' }, 500);

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

  const body = await request.json().catch(() => null);
  const vendorId = typeof body?.vendorId === 'string' ? body.vendorId : '';
  const itemIds = Array.isArray(body?.itemIds) && body.itemIds.every((id: unknown) => typeof id === 'string') ? body.itemIds as string[] : [];
  const quantities = body?.quantities && typeof body.quantities === 'object' ? body.quantities as Record<string, unknown> : {};
  const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';
  if (!vendorId || itemIds.length === 0 || !idempotencyKey) return json({ error: 'vendorId, itemIds, and idempotencyKey are required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const requestedItems = itemIds.map((id) => ({
    id,
    quantity: typeof quantities[id] === 'number' && Number.isInteger(quantities[id]) && (quantities[id] as number) > 0 ? quantities[id] : 1,
  }));
  const { data: order, error: orderError } = await adminClient.rpc('create_order_with_items', {
    p_vendor_id: vendorId,
    p_customer_id: userData.user.id,
    p_idempotency_key: idempotencyKey,
    p_items: requestedItems,
  });
  if (orderError) return json({ error: orderError.message, code: orderError.code }, orderError.code === '23505' ? 409 : 400);
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
  const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
  if (!razorpayKeyId || !razorpayKeySecret || !order?.id || typeof order.total_paise !== 'number') {
    return json({ error: { code: 'PAYMENT_CONFIGURATION_MISSING', message: 'Online payment is not configured for this environment.' } }, 503);
  }

  const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: order.total_paise,
      currency: 'INR',
      receipt: String(order.id),
      payment_capture: 1,
    }),
  });
  if (!razorpayResponse.ok) {
    return json({ error: { code: 'PAYMENT_ORDER_CREATE_FAILED', message: 'Unable to start online payment.' } }, 502);
  }
  const razorpayOrder = await razorpayResponse.json();
  const { data: updatedOrder, error: updateError } = await adminClient
    .from('orders')
    .update({ razorpay_order_id: razorpayOrder.id })
    .eq('id', order.id)
    .select()
    .single();
  if (updateError) return json({ error: updateError.message }, 500);
  if (order?.id) {
    try {
      await adminClient.from('order_status_log').insert({
        order_id: order.id,
        status: 'pending_payment',
        actor_id: userData.user.id,
      });
    } catch {
      // Best-effort event tracking only.
    }
    try {
      await adminClient.from('audit_logs').insert({
        actor_id: userData.user.id,
        action: 'create_order',
        target_table: 'orders',
        target_id: order.id,
        metadata: { vendor_id: vendorId, item_count: itemIds.length },
      });
    } catch {
      // Best-effort event tracking only.
    }
    await adminClient.from('customer_notifications').upsert({
      customer_id: userData.user.id,
      order_id: order.id,
      title: 'Order received',
      body: `Your order #${String(order.id).slice(0, 8)} was sent to the vendor.`,
      notification_type: 'order',
    }, { onConflict: 'order_id', ignoreDuplicates: true });
  }
  return json({ ...updatedOrder, razorpay_key_id: razorpayKeyId }, 201);
});
