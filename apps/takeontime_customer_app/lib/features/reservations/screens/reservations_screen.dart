import 'package:flutter/material.dart';

class ReservationsScreen extends StatefulWidget {
  const ReservationsScreen({super.key});

  @override
  State<ReservationsScreen> createState() => _ReservationsScreenState();
}

class _ReservationsScreenState extends State<ReservationsScreen> {
  final List<Map<String, dynamic>> _reservations = const [
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
