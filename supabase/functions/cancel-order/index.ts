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
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  if (!orderId) return json({ error: 'orderId is required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, customer_id, status, created_at, customer_paid_paise')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order || order.customer_id !== userData.user.id) return json({ error: 'Order not found' }, 404);
  if (!['pending_payment', 'confirmed', 'accepted', 'preparing'].includes(order.status)) return json({ error: { code: 'ORDER_NOT_CANCELLABLE', message: 'This order can no longer be cancelled.' } }, 409);
  if (Date.now() - new Date(order.created_at).getTime() > 2 * 60 * 1000) return json({ error: { code: 'CANCELLATION_WINDOW_EXPIRED', message: 'Orders can only be cancelled within two minutes.' } }, 409);

  const { data: updatedOrder, error: updateError } = await adminClient
    .from('orders')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', order.id)
    .select()
    .single();
  if (updateError) return json({ error: updateError.message }, 409);

  try {
    await adminClient.from('order_status_log').insert({
      order_id: order.id,
      status: 'cancelled',
      actor_id: userData.user.id,
    });
  } catch {
    // Best-effort event tracking only.
  }
  try {
    await adminClient.from('audit_logs').insert({
      actor_id: userData.user.id,
      action: 'cancel_order',
      target_table: 'orders',
      target_id: order.id,
      metadata: { customer_id: order.customer_id, amount_paise: order.customer_paid_paise },
    });
  } catch {
    // Best-effort event tracking only.
  }

  if (order.customer_paid_paise > 0) {
    await adminClient.from('refunds').insert({ order_id: order.id, amount_paise: order.customer_paid_paise, reason: 'Customer cancellation within window' });
  }
  await adminClient.from('customer_notifications').upsert({
    customer_id: order.customer_id,
    order_id: order.id,
    title: 'Order cancelled',
    body: 'Your order was cancelled and the refund has been queued.',
    notification_type: 'order_status',
  }, { onConflict: 'order_id' });
  return json(updatedOrder);
});
