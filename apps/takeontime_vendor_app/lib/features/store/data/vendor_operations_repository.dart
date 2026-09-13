import 'dart:math' as math;

import '../../../core/supabase/supabase_bootstrap.dart';

class VendorMenuCategory {
  const VendorMenuCategory({required this.id, required this.name});

  final String id;
  final String name;

  factory VendorMenuCategory.fromJson(Map<String, dynamic> json) {
    return VendorMenuCategory(id: json['id'] as String, name: json['name'] as String);
  }
}

class VendorMenuItem {
  const VendorMenuItem({required this.id, required this.categoryId, required this.name, required this.description, required this.price, required this.prepMinutes, required this.isAvailable});

  final String id;
  final String categoryId;
  final String name;
  final String description;
  final double price;
  final int prepMinutes;
  final bool isAvailable;

  factory VendorMenuItem.fromJson(Map<String, dynamic> json) {
    return VendorMenuItem(
      id: json['id'] as String,
      categoryId: json['category_id'] as String,
      name: json['name'] as String,
      description: (json['description'] as String?) ?? '',
      price: ((json['price'] as num?)?.toDouble() ?? ((json['price_paise'] as num?)?.toDouble() ?? 0) / 100),
      prepMinutes: (json['prep_minutes'] as num?)?.toInt() ?? 10,
      isAvailable: json['is_available'] as bool? ?? true,
    );
  }

  VendorMenuItem copyWith({bool? isAvailable}) => VendorMenuItem(
        id: id,
        categoryId: categoryId,
        name: name,
        description: description,
        price: price,
        prepMinutes: prepMinutes,
        isAvailable: isAvailable ?? this.isAvailable,
      );
}

class VendorMenuSnapshot {
  const VendorMenuSnapshot({required this.categories, required this.items});

  final List<VendorMenuCategory> categories;
  final List<VendorMenuItem> items;
}

class VendorOrder {
  const VendorOrder({required this.id, required this.customer, required this.item, required this.quantity, required this.amountPaise, required this.status, required this.time, required this.pickup, this.note});

  final String id;
  final String customer;
  final String item;
  final int quantity;
  final int amountPaise;
  final String status;
  final String time;
  final String pickup;
  final String? note;

  factory VendorOrder.fromJson(Map<String, dynamic> json) {
    final customer = json['customer'] as Map<String, dynamic>?;
    final items = ((json['order_items'] as List<dynamic>?) ?? const []).whereType<Map<String, dynamic>>().toList();
    return VendorOrder(
      id: json['id'] as String,
      customer: customer?['full_name'] as String? ?? customer?['email'] as String? ?? 'Customer',
      item: items.map((item) => '${item['quantity'] ?? 1} x ${item['name'] ?? 'Order item'}').join(', '),
      quantity: items.fold<int>(0, (total, item) => total + ((item['quantity'] as num?)?.toInt() ?? 1)),
      amountPaise: (json['total_paise'] as num?)?.toInt() ?? 0,
      status: _displayStatus(json['status'] as String? ?? 'pending_payment'),
      time: _displayTime(json['created_at'] as String?),
      pickup: 'Pickup time to be confirmed',
      note: json['notes'] as String?,
    );
  }

  static String _displayStatus(String status) => switch (status) {
        'confirmed' => 'Accepted',
        'accepted' => 'Accepted',
        'preparing' => 'Preparing',
        'ready' => 'Ready',
        'completed' => 'Completed',
        'cancelled' || 'rejected' => 'Cancelled',
        _ => 'New',
      };

  static String _displayTime(String? value) => value == null ? 'Recently' : DateTime.tryParse(value)?.toLocal().toString() ?? 'Recently';

  VendorOrder copyWith({String? status}) => VendorOrder(id: id, customer: customer, item: item, quantity: quantity, amountPaise: amountPaise, status: status ?? this.status, time: time, pickup: pickup, note: note);
}

class VendorOperationsRepository {
  const VendorOperationsRepository();

  Future<String?> resolveVendorId({String? fallback}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) return fallback;
    final user = client.auth.currentUser;
    if (user == null) return fallback;

    try {
      final row = await client
          .from('vendors')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at')
          .limit(1)
          .maybeSingle();
      return row?['id'] as String?;
    } catch (_) {
      return fallback;
    }
  }

  Future<Map<String, dynamic>?> fetchOwnedVendor() async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;
    return client
        .from('vendors')
        .select('id, business_name, business_type, address, merchant_id, is_approved, approval_note')
        .eq('owner_id', user.id)
        .order('created_at')
        .limit(1)
        .maybeSingle();
  }

  Future<Map<String, dynamic>> createOwnedVendor({
    required String businessName,
    required String businessType,
    required String address,
  }) async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) {
      throw StateError('Sign in before creating a vendor profile.');
    }
    final row = await client.from('vendors').insert({
      'id': 'vendor-${DateTime.now().toUtc().microsecondsSinceEpoch}',
      'owner_id': user.id,
      'business_name': businessName,
      'business_type': businessType,
      'address': address,
      'merchant_id': '',
      'accepting_orders': false,
      'is_approved': false,
    }).select('id, business_name, business_type, address, merchant_id, is_approved').single();
    return Map<String, dynamic>.from(row);
  }

  Future<void> updateVendorProfile({
    required String vendorId,
    required String businessName,
    required String businessType,
    required String address,
  }) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    await client.from('vendors').update({
      'business_name': businessName,
      'business_type': businessType,
      'address': address,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', vendorId);
  }

  Future<List<VendorOrder>> fetchOrders(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final rows = await client.from('orders').select('id, status, total_paise, created_at, notes, customer:users(full_name, email), order_items(name, quantity, unit_price_paise)').eq('vendor_id', vendorId).order('created_at', ascending: false);
    return rows.map((row) => VendorOrder.fromJson(row)).toList();
  }

  Future<VendorOrder> updateOrderStatus({required String vendorId, required VendorOrder order, required String status}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final response = await client.functions.invoke('update-order-status', body: {'orderId': order.id, 'vendorId': vendorId, 'newStatus': _canonicalStatus(status)});
    final data = response.data;
    if (data is! Map) throw StateError('The order service returned an invalid response.');
    return VendorOrder.fromJson(Map<String, dynamic>.from(data));
  }

  String _canonicalStatus(String status) => switch (status) {
        'Accepted' => 'accepted',
        'Preparing' => 'preparing',
        'Ready' => 'ready',
        'Completed' => 'completed',
        'Cancelled' => 'cancelled',
        _ => 'accepted',
      };

  Future<VendorMenuSnapshot> fetchMenu(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');

    final plans = await client
        .from('subscription_plans')
        .select('id, vendor_id, name, description, base_price_paise, total_meals, duration_days, is_active')
        .eq('vendor_id', vendorId)
        .order('created_at', ascending: false);

    return VendorMenuSnapshot(
      categories: const [],
      items: plans.map((row) => VendorMenuItem(
        id: row['id'] as String,
        categoryId: row['vendor_id'] as String? ?? vendorId,
        name: row['name'] as String? ?? 'Meal plan',
        description: (row['description'] as String?) ?? '',
        price: ((row['base_price_paise'] as num?)?.toDouble() ?? 0) / 100,
        prepMinutes: row['duration_days'] as int? ?? 30,
        isAvailable: row['is_active'] as bool? ?? true,
      )).toList(),
    );
  }

  Future<VendorMenuCategory> createCategory({required String vendorId, required String name}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final row = await client.from('subscription_plans').insert({
      'id': 'plan-${DateTime.now().millisecondsSinceEpoch}',
      'vendor_id': vendorId,
      'name': name,
      'description': 'Vendor-created plan',
      'total_meals': 1,
      'duration_days': 30,
      'daily_limit': 1,
      'base_price_paise': 0,
      'meal_slots': [{'slot': 'lunch', 'description': 'Daily lunch meal'}],
      'is_active': true,
    }).select().single();
    return VendorMenuCategory(id: row['id'] as String, name: row['name'] as String? ?? name);
  }

  Future<VendorMenuItem> createItem({required String vendorId, required String categoryId, required String name, required String description, required double price, required int prepMinutes, required bool isAvailable}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final row = await client.from('subscription_plans').insert({
      'id': 'plan-${DateTime.now().millisecondsSinceEpoch}',
      'vendor_id': vendorId,
      'name': name,
      'description': description,
      'total_meals': math.max(1, prepMinutes),
      'duration_days': math.max(1, prepMinutes),
      'daily_limit': 1,
      'base_price_paise': (price * 100).round(),
      'meal_slots': [{'slot': 'lunch', 'description': description}],
      'is_active': isAvailable,
    }).select().single();
    return VendorMenuItem.fromJson({
      'id': row['id'],
      'category_id': categoryId,
      'name': row['name'],
      'description': row['description'],
      'price_paise': row['base_price_paise'],
      'prep_minutes': row['duration_days'],
      'is_available': row['is_active'],
    });
  }

  Future<VendorMenuItem> updateItem({required String vendorId, required VendorMenuItem item, String? name, String? description, double? price, int? prepMinutes, bool? isAvailable}) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final row = await client.from('subscription_plans').update({
      'name': name ?? item.name,
      'description': description ?? item.description,
      'base_price_paise': ((price ?? item.price) * 100).round(),
      'duration_days': prepMinutes ?? item.prepMinutes,
      'is_active': isAvailable ?? item.isAvailable,
    }).eq('id', item.id).eq('vendor_id', vendorId).select().single();
    return VendorMenuItem.fromJson({
      'id': row['id'],
      'category_id': vendorId,
      'name': row['name'],
      'description': row['description'],
      'price_paise': row['base_price_paise'],
      'prep_minutes': row['duration_days'],
      'is_available': row['is_active'],
    });
  }

  Future<Map<String, dynamic>?> fetchSnapshot(String vendorId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
    }

    final vendor = await client.from('vendors').select().eq('id', vendorId).maybeSingle();
    if (vendor == null) return null;

    final plans = await client
        .from('subscription_plans')
        .select('id, name, description, total_meals, duration_days, base_price_paise, is_active')
        .eq('vendor_id', vendorId)
        .order('created_at', ascending: false);
    final orders = await client.from('orders').select('id, status, total_paise, created_at, customer_id').eq('vendor_id', vendorId).order('created_at', ascending: false);
    final settlements = await client.from('settlement_batches').select().eq('vendor_id', vendorId).order('created_at', ascending: false);

    return {
      'vendor': vendor,
      'categories': const [],
      'items': plans,
      'orders': orders,
      'settlements': settlements,
    };
  }

  Future<void> updateStore({
    required String vendorId,
    required bool acceptingOrders,
    DateTime? breakUntil,
  }) async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      throw StateError('Supabase is not configured. Pass SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
    }

    await client.from('vendors').update({
      'accepting_orders': acceptingOrders,
      'break_until': breakUntil?.toUtc().toIso8601String(),
    }).eq('id', vendorId);
  }
}
