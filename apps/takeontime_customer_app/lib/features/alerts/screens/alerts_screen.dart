import 'package:flutter/material.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final _alerts = <_AlertItem>[
    _AlertItem('Little Fern Kitchen', 'Your order #1041 is being prepared.', '12 mins ago'),
    _AlertItem('Rewards', 'You unlocked a ₹60 cashback reward.', '1 hour ago'),
    _AlertItem('Delivery', 'Your driver is 6 minutes away.', '2 hours ago'),
  ];

  int get _unreadCount => _alerts.where((alert) => !alert.read).length;

  void _markAllRead() => setState(() {
        for (final alert in _alerts) {
          alert.read = true;
        }
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_unreadCount == 0 ? 'Alerts' : 'Alerts ($_unreadCount)'),
        actions: [IconButton(onPressed: _unreadCount == 0 ? null : _markAllRead, tooltip: 'Mark all as read', icon: const Icon(Icons.done_all))],
      ),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _alerts.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final alert = _alerts[index];
            return Dismissible(
              key: ValueKey('${alert.title}-$index'),
              background: Container(color: Colors.red.shade100, alignment: Alignment.centerLeft, padding: const EdgeInsets.only(left: 20), child: const Icon(Icons.delete_outline)),
              secondaryBackground: Container(color: Colors.red.shade100, alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), child: const Icon(Icons.delete_outline)),
              onDismissed: (_) => setState(() => _alerts.removeAt(index)),
              child: Card(
                color: alert.read ? null : Theme.of(context).colorScheme.primaryContainer,
                child: ListTile(
                  onTap: () => setState(() => alert.read = true),
                  leading: Icon(alert.read ? Icons.notifications_none : Icons.notifications_active_outlined),
                  title: Text(alert.title, style: TextStyle(fontWeight: alert.read ? FontWeight.normal : FontWeight.w700)),
                  subtitle: Text(alert.message),
                  trailing: Text(alert.time),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _AlertItem {
  _AlertItem(this.title, this.message, this.time);

  final String title;
  final String message;
  final String time;
  bool read = false;
}
