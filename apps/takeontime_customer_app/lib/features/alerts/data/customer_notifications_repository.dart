import '../../../core/supabase/supabase_bootstrap.dart';

class CustomerNotification {
  const CustomerNotification({required this.id, required this.title, required this.body, required this.isRead, required this.createdAt});

  final String id;
  final String title;
  final String body;
  final bool isRead;
  final DateTime? createdAt;

  factory CustomerNotification.fromJson(Map<String, dynamic> json) => CustomerNotification(
        id: json['id'] as String,
        title: json['title'] as String? ?? 'TakeOnTime',
        body: json['body'] as String? ?? '',
        isRead: json['is_read'] as bool? ?? false,
        createdAt: DateTime.tryParse(json['created_at'] as String? ?? ''),
      );
}

class CustomerNotificationsRepository {
  const CustomerNotificationsRepository();

  Future<List<CustomerNotification>> fetchNotifications(String customerId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    final rows = await client.from('customer_notifications').select().eq('customer_id', customerId).order('created_at', ascending: false);
    return rows.map((row) => CustomerNotification.fromJson(row)).toList();
  }

  Future<void> markRead(String notificationId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    await client.from('customer_notifications').update({'is_read': true}).eq('id', notificationId);
  }

  Future<void> delete(String notificationId) async {
    final client = SupabaseBootstrap.client;
    if (client == null) throw StateError('Supabase is not configured.');
    await client.from('customer_notifications').delete().eq('id', notificationId);
  }
}
