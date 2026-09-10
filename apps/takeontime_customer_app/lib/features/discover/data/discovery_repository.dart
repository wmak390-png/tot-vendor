import '../../../core/supabase/supabase_bootstrap.dart';

class DiscoveryRepository {
  const DiscoveryRepository();

  Future<List<Map<String, dynamic>>> fetchAvailableItems(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final rows = await client
        .from('vendor_items')
        .select('id, category_id, name, description, price_paise, prep_minutes, is_available')
        .eq('vendor_id', vendorId)
        .eq('is_available', true);
    return List<Map<String, dynamic>>.from(rows);
  }

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
