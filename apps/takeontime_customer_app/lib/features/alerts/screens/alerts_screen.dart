import 'package:flutter/material.dart';

import '../../../core/services/customer_app_service.dart';
import '../../../core/supabase/supabase_bootstrap.dart';
import '../data/customer_notifications_repository.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final _service = const CustomerAppService();
  final _repository = const CustomerNotificationsRepository();
  late List<_AlertItem> _alerts = _service.alerts
      .map((alert) => _AlertItem.demo(alert.title, alert.message, alert.time))
      .toList();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  Future<void> _loadAlerts() async {
    final customerId = SupabaseBootstrap.client?.auth.currentUser?.id;
    if (customerId == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }
    try {
      final notifications = await _repository.fetchNotifications(customerId);
      if (mounted) {
        setState(() {
            _alerts = notifications
              .map((notification) => _AlertItem(
                notification.id,
                notification.title,
                notification.body,
                notification.createdAt?.toLocal().toString() ?? 'Recently',
                read: notification.isRead,
                ))
              .toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() { _alerts = []; _loading = false; });
    }
  }

  int get _unreadCount => _alerts.where((alert) => !alert.read).length;

  Future<void> _markAllRead() async {
    final unread = _alerts.where((alert) => !alert.read).toList();
    setState(() {
      for (final alert in unread) {
        alert.read = true;
      }
    });
    for (final alert in unread) {
      if (alert.id != null) await _repository.markRead(alert.id!);
    }
  }

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
          itemCount: _alerts.length + (_loading ? 1 : 0),
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            if (_loading && index == 0) return const LinearProgressIndicator();
            final alert = _alerts[index - (_loading ? 1 : 0)];
            return Dismissible(
              key: ValueKey('${alert.title}-$index'),
              background: Container(color: Colors.red.shade100, alignment: Alignment.centerLeft, padding: const EdgeInsets.only(left: 20), child: const Icon(Icons.delete_outline)),
              secondaryBackground: Container(color: Colors.red.shade100, alignment: Alignment.centerRight, padding: const EdgeInsets.only(right: 20), child: const Icon(Icons.delete_outline)),
              onDismissed: (_) async {
                setState(() => _alerts.remove(alert));
                if (alert.id != null) await _repository.delete(alert.id!);
              },
              child: Card(
                color: alert.read ? null : Theme.of(context).colorScheme.primaryContainer,
                child: ListTile(
                  onTap: () async {
                    setState(() => alert.read = true);
                    if (alert.id != null) await _repository.markRead(alert.id!);
                  },
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
  _AlertItem(this.id, this.title, this.message, this.time, {this.read = false});
  _AlertItem.demo(this.title, this.message, this.time)
      : id = null,
        read = false;

  final String? id;
  final String title;
  final String message;
  final String time;
  bool read;
}
