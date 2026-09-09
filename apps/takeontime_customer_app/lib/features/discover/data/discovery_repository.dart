import '../../../core/supabase/supabase_bootstrap.dart';

class DiscoveryRepository {
  const DiscoveryRepository();

  Future<List<Map<String, dynamic>>> fetchApprovedVendors() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    final rows = await client
        .from('vendors')
        .select('id, business_name, business_type, logo_url, accepting_orders, break_until, address')
        .eq('is_approved', true)
        .order('business_name');
    return List<Map<String, dynamic>>.from(rows);
  }
}
