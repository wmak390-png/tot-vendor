import '../../../core/supabase/supabase_bootstrap.dart';

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.status,
    required this.totalPaise,
    required this.createdAt,
    required this.vendorName,
    required this.notes,
    required this.items,
  });

  final String id;
  final String status;
  final int totalPaise;
  final DateTime? createdAt;
  final String vendorName;
  final String? notes;
  final List<CustomerOrderItem> items;

  factory CustomerOrder.fromJson(Map<String, dynamic> json) {
    return CustomerOrder(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'pending_payment',
      totalPaise: (json['total_paise'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? ''),
      vendorName: (json['vendors'] as Map<String, dynamic>?)?['business_name'] as String? ?? 'TakeOnTime vendor',
      notes: json['notes'] as String?,
      items: ((json['order_items'] as List<dynamic>?) ?? const [])
          .whereType<Map<String, dynamic>>()
          .map(CustomerOrderItem.fromJson)
          .toList(),
    );
  }
}

class CustomerOrderItem {
  const CustomerOrderItem({required this.name, required this.quantity, required this.unitPricePaise});

  final String name;
  final int quantity;
  final int unitPricePaise;

  factory CustomerOrderItem.fromJson(Map<String, dynamic> json) => CustomerOrderItem(
        name: json['name'] as String? ?? 'Order item',
        quantity: (json['quantity'] as num?)?.toInt() ?? 1,
        unitPricePaise: (json['unit_price_paise'] as num?)?.toInt() ?? 0,
      );
}

class CustomerOrdersRepository {
  const CustomerOrdersRepository();

  Future<Map<String, dynamic>> createOrder({required String vendorId, required List<String> itemIds, String? idempotencyKey}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    if (client.auth.currentUser == null) throw StateError('Sign in before placing an order.');

    final response = await client.functions.invoke(
      'create-order',
      body: {
        'vendorId': vendorId,
        'itemIds': itemIds,
        'idempotencyKey': idempotencyKey ?? 'checkout-${DateTime.now().toUtc().microsecondsSinceEpoch}',
      },
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
      .select('id, status, subtotal_paise, total_paise, created_at, notes, vendors(business_name), order_items(name, quantity, unit_price_paise)')
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
