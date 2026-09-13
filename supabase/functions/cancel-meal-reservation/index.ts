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
  const reservationId = typeof body?.reservationId === 'string' ? body.reservationId : '';
  if (!reservationId) return json({ error: 'reservationId is required' }, 400);

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: reservation, error: cancellationError } = await adminClient.rpc('cancel_meal_reservation', {
    p_reservation_id: reservationId,
    p_user_id: userData.user.id,
  });
  if (cancellationError) {
    const status = cancellationError.code === 'P0002' ? 404 : 409;
    return json({ error: { code: cancellationError.code, message: cancellationError.message } }, status);
  }

  try {
    await adminClient.from('audit_logs').insert({
      actor_id: userData.user.id,
      action: 'cancel_meal_reservation',
      target_table: 'meal_reservations',
      target_id: reservationId,
      metadata: { reservation_id: reservationId },
    });
  } catch {
    // Audit logging is best-effort only.
  }

  return json(reservation);
});
