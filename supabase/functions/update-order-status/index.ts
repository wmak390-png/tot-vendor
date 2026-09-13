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
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  const requestedVendorId = typeof body?.vendorId === 'string' ? body.vendorId : '';
  const status = typeof body?.newStatus === 'string' ? body.newStatus : typeof body?.status === 'string' ? body.status : '';
  if (!orderId || !status) return json({ error: 'orderId and newStatus are required' }, 400);
  const statusAliases: Record<string, string> = {
    New: 'confirmed',
    Accepted: 'accepted',
    Preparing: 'preparing',
    Ready: 'ready',
    Completed: 'completed',
    Cancelled: 'cancelled',
  };
  const canonicalStatus = statusAliases[status] ?? status;
  const validStatuses = ['accepted', 'preparing', 'ready', 'completed', 'rejected', 'cancelled'];
  if (!validStatuses.includes(canonicalStatus)) return json({ error: 'Invalid order status' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, vendor_id, customer_id, status')
    .eq('id', orderId)
    .maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order) return json({ error: 'Order not found' }, 404);

  const { data: vendor, error: vendorError } = await adminClient
    .from('vendors')
    .select('owner_id')
    .eq('id', order.vendor_id)
    .maybeSingle();
  if (vendorError) return json({ error: vendorError.message }, 500);
  if (!vendor || vendor.owner_id !== userData.user.id) return json({ error: 'Vendor access denied' }, 403);
  if (requestedVendorId && requestedVendorId !== order.vendor_id) return json({ error: 'Vendor access denied' }, 403);

  const { data: updatedOrder, error: updateError } = await adminClient
    .from('orders')
    .update({ status: canonicalStatus })
    .eq('id', orderId)
    .select('id, status, total_paise, created_at, notes, customer:users(full_name, email), order_items(name, quantity, unit_price_paise)')
    .maybeSingle();
  if (updateError) return json({ error: updateError.message, code: updateError.code }, 409);
  if (!updatedOrder) return json({ error: 'Order not found' }, 404);
  await adminClient.from('customer_notifications').upsert({
      customer_id: order.customer_id,
      order_id: order.id,
      title: 'Order status updated',
      body: `Your order #${String(orderId).slice(0, 8)} is now ${canonicalStatus.replace('_', ' ')}.`,
      notification_type: 'order_status',
    }, { onConflict: 'order_id' });
  return json(updatedOrder);
});
