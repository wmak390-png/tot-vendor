import '../../../core/supabase/supabase_bootstrap.dart';

class CustomerOrder {
  const CustomerOrder({required this.id, required this.status, required this.totalPaise, required this.createdAt});

  final String id;
  final String status;
  final int totalPaise;
  final DateTime? createdAt;

  factory CustomerOrder.fromJson(Map<String, dynamic> json) {
    return CustomerOrder(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'pending_payment',
      totalPaise: (json['total_paise'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? ''),
    );
  }
}

class CustomerOrdersRepository {
  const CustomerOrdersRepository();

  Future<Map<String, dynamic>> createOrder({required String vendorId, required List<String> itemIds}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    if (client.auth.currentUser == null) throw StateError('Sign in before placing an order.');

    final response = await client.functions.invoke(
      'create-order',
      body: {'vendorId': vendorId, 'itemIds': itemIds},
    );
    final data = response.data;
    if (data is! Map) throw StateError('The order service returned an invalid response.');
    return Map<String, dynamic>.from(data);
  }

  Future<List<CustomerOrder>> fetchOrders(String customerId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');

    final rows = await client
        .from('orders')
        .select('id, status, total_paise, created_at')
        .eq('customer_id', customerId)
        .order('created_at', ascending: false);
    return rows.map((row) => CustomerOrder.fromJson(row)).toList();
  }

  Stream<List<Map<String, dynamic>>> watchOrders(String customerId) {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');

    return client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('customer_id', customerId)
        .order('created_at', ascending: false);
  }
}
