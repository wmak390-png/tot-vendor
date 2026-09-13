import '../../../core/supabase/supabase_bootstrap.dart';

class DiscoveryRepository {
  const DiscoveryRepository();

  Future<List<Map<String, dynamic>>> fetchAvailableItems(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');

    final rows = await client
        .from('subscription_plans')
        .select('id, vendor_id, name, description, total_meals, duration_days, daily_limit, base_price_paise, is_active')
        .eq('vendor_id', vendorId)
        .eq('is_active', true)
        .order('created_at', ascending: false);

    return rows.map((row) {
      final item = Map<String, dynamic>.from(row);
      item['category_id'] = vendorId;
      item['is_available'] = true;
      return item;
    }).toList();
  }

  Future<List<Map<String, dynamic>>> fetchApprovedVendors() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    final rows = await client
        .from('vendors')
        .select('id, business_name, business_type, logo_url, accepting_orders, break_until, address, institution_id, status')
        .eq('is_approved', true)
        .order('business_name');
    return List<Map<String, dynamic>>.from(rows);
  }
}
