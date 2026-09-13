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

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: admin, error: adminError } = await adminClient
    .from('users')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (adminError) return json({ error: adminError.message }, 500);
  if (!admin || admin.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const body = await request.json().catch(() => null);
  const vendorId = typeof body?.vendorId === 'string' ? body.vendorId : '';
  const decision = body?.decision === 'approve' || body?.decision === 'reject' ? body.decision : null;
  const approved = decision === 'approve' ? true : decision === 'reject' ? false : typeof body?.approved === 'boolean' ? body.approved : null;
  const approvalNote = typeof body?.reason === 'string' ? body.reason.trim() : typeof body?.approvalNote === 'string' ? body.approvalNote.trim() : '';
  if (!vendorId || approved === null) return json({ error: 'vendorId and decision are required' }, 400);
  if (!approved && !approvalNote) return json({ error: 'A rejection reason is required', code: 'REJECTION_REASON_REQUIRED' }, 400);

  const { data: vendor, error: updateError } = await adminClient
    .from('vendors')
    .update({
      is_approved: approved,
      approval_note: approved ? null : approvalNote,
      status: approved ? 'active' : 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorId)
    .select()
    .maybeSingle();
  if (updateError) return json({ error: updateError.message }, 500);
  if (!vendor) return json({ error: 'Vendor not found' }, 404);

  try {
    await adminClient.from('audit_logs').insert({
      actor_id: userData.user.id,
      action: approved ? 'approve_vendor' : 'reject_vendor',
      target_table: 'vendors',
      target_id: vendor.id,
      metadata: { decision: approved ? 'approve' : 'reject', reason: approvalNote || null },
    });
  } catch {
    // Audit logging is best-effort only.
  }

  return json({ ...vendor, decision: approved ? 'approve' : 'reject' });
});
