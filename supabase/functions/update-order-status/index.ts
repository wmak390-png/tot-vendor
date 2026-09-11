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
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  const vendorId = typeof body?.vendorId === 'string' ? body.vendorId : '';
  const status = typeof body?.status === 'string' ? body.status : '';
  if (!orderId || !vendorId || !status) return json({ error: 'orderId, vendorId, and status are required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: vendor, error: vendorError } = await adminClient
    .from('vendors')
    .select('owner_id')
    .eq('id', vendorId)
    .maybeSingle();
  if (vendorError) return json({ error: vendorError.message }, 500);
  if (!vendor || vendor.owner_id !== userData.user.id) return json({ error: 'Vendor access denied' }, 403);

  const { data: order, error: updateError } = await adminClient
    .from('vendor_orders')
    .update({ status })
    .eq('id', orderId)
    .eq('vendor_id', vendorId)
    .select()
    .maybeSingle();
  if (updateError) return json({ error: updateError.message, code: updateError.code }, 409);
  if (!order) return json({ error: 'Order not found' }, 404);
  return json(order);
});
