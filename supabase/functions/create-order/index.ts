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
  if (order?.id) {
    await adminClient.from('customer_notifications').upsert({
      customer_id: userData.user.id,
      order_id: order.id,
      title: 'Order received',
      body: `Your order #${String(order.id).slice(0, 8)} was sent to the vendor.`,
      notification_type: 'order',
    }, { onConflict: 'order_id', ignoreDuplicates: true });
  }
  return json(order, 201);
});
