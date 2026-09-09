import '../../../core/supabase/supabase_bootstrap.dart';

class VendorOperationsRepository {
  const VendorOperationsRepository();

  Future<Map<String, dynamic>?> fetchSnapshot(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    final vendor = await client.from('vendors').select().eq('id', vendorId).maybeSingle();
    if (vendor == null) return null;

    final categories = await client.from('menu_categories').select().eq('vendor_id', vendorId).order('sort_order');
    final items = await client.from('menu_items').select().eq('vendor_id', vendorId).order('sort_order');
    final orders = await client.from('orders').select().eq('vendor_id', vendorId).order('created_at', ascending: false);

    return {
      'vendor': vendor,
      'categories': categories,
      'items': items,
      'orders': orders,
    };
  }

  Future<void> updateStore({
    required String vendorId,
    required bool acceptingOrders,
    DateTime? breakUntil,
  }) async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.');
    }

    await client.from('vendors').update({
      'accepting_orders': acceptingOrders,
      'break_until': breakUntil?.toUtc().toIso8601String(),
    }).eq('id', vendorId);
  }
}
