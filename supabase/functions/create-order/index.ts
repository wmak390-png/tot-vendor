import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
  if (!vendorId || itemIds.length === 0) return json({ error: 'vendorId and itemIds are required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: vendor, error: vendorError } = await adminClient
    .from('vendors')
    .select('id, is_approved, accepting_orders, break_until')
    .eq('id', vendorId)
    .maybeSingle();
  if (vendorError) return json({ error: vendorError.message }, 500);
  if (!vendor) return json({ error: 'Vendor not found' }, 404);
  if (!vendor.is_approved) return json({ error: 'Vendor is not approved' }, 409);
  if (!vendor.accepting_orders) return json({ error: 'Vendor is not accepting orders' }, 409);
  if (vendor.break_until && new Date(vendor.break_until).getTime() > Date.now()) return json({ error: 'Vendor is temporarily unavailable' }, 409);

  const { data: items, error: itemError } = await adminClient
    .from('vendor_items')
    .select('id, name, price_paise, is_available')
    .eq('vendor_id', vendorId)
    .in('id', itemIds);
  if (itemError) return json({ error: itemError.message }, 500);
  if (!items || items.length !== itemIds.length) return json({ error: 'One or more menu items are invalid' }, 400);
  if (items.some((item) => !item.is_available)) return json({ error: 'One or more menu items are unavailable' }, 409);

  const orderItems = items.map((item) => {
    const rawQuantity = quantities[item.id];
    const quantity = typeof rawQuantity === 'number' && Number.isInteger(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;
    return { menu_item_id: item.id, name: item.name, quantity, unit_price_paise: item.price_paise };
  });
  const subtotalPaise = orderItems.reduce((total, item) => total + item.unit_price_paise * item.quantity, 0);

  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .insert({
      vendor_id: vendorId,
      customer_id: userData.user.id,
      status: 'pending_payment',
      subtotal_paise: subtotalPaise,
      total_paise: subtotalPaise,
    })
    .select('id, status, subtotal_paise, total_paise, created_at')
    .single();
  if (orderError) return json({ error: orderError.message }, 500);

  const { error: itemInsertError } = await adminClient
    .from('order_items')
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemInsertError) {
    await adminClient.from('orders').delete().eq('id', order.id);
    return json({ error: itemInsertError.message }, 500);
  }

  return json(order, 201);
});
