import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

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
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  if (!orderId || !code) return json({ error: 'orderId and code are required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, vendor_id, status, pickup_otp_hash')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order) return json({ error: 'Order not found' }, 404);

  const { data: vendor } = await adminClient.from('vendors').select('owner_id').eq('id', order.vendor_id).maybeSingle();
  const isAdmin = await adminClient.from('users').select('role').eq('id', userData.user.id).eq('role', 'admin').maybeSingle();
  if (!vendor || (vendor.owner_id !== userData.user.id && !isAdmin.data)) return json({ error: 'Pickup verification access denied' }, 403);
  if (order.status !== 'ready') return json({ error: { code: 'ORDER_NOT_READY', message: 'Only ready orders can be collected.' } }, 409);
  if (!order.pickup_otp_hash || (await digest(code)) !== order.pickup_otp_hash) return json({ error: { code: 'PICKUP_CODE_INVALID', message: 'That pickup code is not valid.' } }, 409);

  const { data: updatedOrder, error: updateError } = await adminClient
    .from('orders')
    .update({ status: 'completed', pickup_verified_at: new Date().toISOString() })
    .eq('id', order.id)
    .eq('status', 'ready')
    .select()
    .maybeSingle();
  if (updateError) return json({ error: updateError.message }, 409);
  if (!updatedOrder) return json({ error: { code: 'ORDER_STATE_CHANGED', message: 'The order changed before pickup verification completed.' } }, 409);

  try {
    await adminClient.from('order_status_log').insert({
      order_id: order.id,
      status: 'completed',
      actor_id: userData.user.id,
    });
  } catch {
    // Best-effort event tracking only.
  }
  try {
    await adminClient.from('audit_logs').insert({
      actor_id: userData.user.id,
      action: 'verify_pickup',
      target_table: 'orders',
      target_id: order.id,
      metadata: { verified_by: userData.user.id, pickup_code_match: true },
    });
  } catch {
    // Best-effort event tracking only.
  }

  return json({ verified: true, order: updatedOrder });
});
