import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
  List<Map<String, dynamic>> _reservations = [
    {
      'title': 'Lunch reservation',
      'vendor': 'Tiffin & Co.',
      'time': 'Today · 12:30 PM',
      'status': 'Confirmed',
      'type': 'Meal pass',
    },
    {
      'title': 'Evening table',
      'vendor': 'Green Bowl',
      'time': 'Tomorrow · 7:00 PM',
      'status': 'Pending',
      'type': 'Table',
    },
  ];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReservations();
  }

  Future<void> _loadReservations() async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final rows = await client
          .from('meal_reservations')
          .select('id, status, expires_at, created_at, subscription_orders(meal_slot, scheduled_pickup_time, vendors(business_name))')
          .order('created_at', ascending: false);
      if (mounted) {
        setState(() {
          _reservations = rows.map((row) {
            final order = row['subscription_orders'] as Map<String, dynamic>?;
            final vendor = order?['vendors'] as Map<String, dynamic>?;
            final pickup = DateTime.tryParse(order?['scheduled_pickup_time'] as String? ?? '')?.toLocal();
            final status = row['status'] as String? ?? 'reserved';
            return {
              'title': '${order?['meal_slot'] ?? 'Meal'} reservation',
              'vendor': vendor?['business_name'] as String? ?? 'TakeOnTime vendor',
              'time': pickup == null ? 'Pickup time pending' : _formatDateTime(pickup),
              'status': _displayStatus(status),
              'type': 'Meal pass',
            };
          }).toList();
        });
      }
    } catch (_) {
      if (mounted) setState(() => _reservations = const []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  static String _displayStatus(String value) => switch (value) {
        'reserved' => 'Confirmed',
        'consumed' => 'Consumed',
        'no_show' => 'No show',
        'cancelled' => 'Cancelled',
        _ => value,
      };

  static String _formatDateTime(DateTime value) => '${value.day}/${value.month} · ${value.hour == 0 ? 12 : value.hour > 12 ? value.hour - 12 : value.hour}:${value.minute.toString().padLeft(2, '0')} ${value.hour >= 12 ? 'PM' : 'AM'}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('RESERVATIONS', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('My bookings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [IconButton(onPressed: _loadReservations, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh reservations')],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Theme.of(context).colorScheme.primaryContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Reservation summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 8),
                  Text('2 active bookings · 1 meal pass reservation ready for check-in.', style: Theme.of(context).textTheme.bodyMedium),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          if (_loading) const LinearProgressIndicator(),
          if (!_loading && _reservations.isEmpty)
            const Card(child: ListTile(title: Text('No reservations yet'), subtitle: Text('Reserve a meal from an active subscription to see it here.'))),
          ..._reservations.map((reservation) => _ReservationCard(reservation: reservation)),
        ],
      ),
    );
  }
}

class _ReservationCard extends StatelessWidget {
  const _ReservationCard({required this.reservation});

  final Map<String, dynamic> reservation;

  @override
  Widget build(BuildContext context) {
    final status = reservation['status'] as String? ?? 'Confirmed';
    final color = status == 'Pending' ? Colors.orange : Colors.green;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(reservation['title'] as String? ?? 'Reservation', style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text('${reservation['vendor']} · ${reservation['time']}\n${reservation['type']}'),
        isThreeLine: true,
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 11)),
        ),
      ),
    );
  }
}
