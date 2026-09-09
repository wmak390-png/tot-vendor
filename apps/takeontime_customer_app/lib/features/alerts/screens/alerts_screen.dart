import 'package:flutter/material.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final alerts = [
      _AlertItem('Little Fern Kitchen', 'Your order #1041 is being prepared.', '12 mins ago'),
      _AlertItem('Rewards', 'You unlocked a ₹60 cashback reward.', '1 hour ago'),
      _AlertItem('Delivery', 'Your driver is 6 minutes away.', '2 hours ago'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Alerts')),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: alerts.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final alert = alerts[index];
            return Card(
              child: ListTile(
                leading: const Icon(Icons.notifications_active_outlined),
                title: Text(alert.title),
                subtitle: Text(alert.message),
                trailing: Text(alert.time),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _AlertItem {
  const _AlertItem(this.title, this.message, this.time);

  final String title;
  final String message;
  final String time;
}
