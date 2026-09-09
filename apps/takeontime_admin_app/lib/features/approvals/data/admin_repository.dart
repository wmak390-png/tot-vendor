import '../../../core/supabase/supabase_bootstrap.dart';

class AdminRepository {
  const AdminRepository();

  Future<List<Map<String, dynamic>>> fetchPendingVendors() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    final rows = await client
        .from('vendors')
        .select('id, owner_id, business_name, business_type, address, approval_note, created_at')
        .eq('is_approved', false)
        .order('created_at');
    return List<Map<String, dynamic>>.from(rows);
  }
}
