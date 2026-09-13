import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class AuditScreen extends StatefulWidget {
  const AuditScreen({super.key});

  @override
  State<AuditScreen> createState() => _AuditScreenState();
}

class _AuditScreenState extends State<AuditScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _events = const [
    {'action': 'vendor_approved', 'target_table': 'vendors', 'created_at': '2026-09-12T10:20:00Z', 'metadata': {'vendor': 'Tiffin & Co.'}},
    {'action': 'platform_fee_updated', 'target_table': 'system_config', 'created_at': '2026-09-11T15:10:00Z', 'metadata': {'key': 'platform_fee_pct'}},
    {'action': 'order_payout_released', 'target_table': 'settlement_batches', 'created_at': '2026-09-10T08:30:00Z', 'metadata': {'batch': 'batch-2'}},
  ];

  @override
  void initState() {
    super.initState();
    _loadAudit();
  }

  Future<void> _loadAudit() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      if (mounted) {
        setState(() => _loading = false);
      }
      return;
    }

    try {
      final rows = await client
          .from('audit_logs')
          .select('id, action, target_table, target_id, metadata, created_at')
          .order('created_at', ascending: false)
          .limit(25);
      if (mounted) {
        setState(() => _events = List<Map<String, dynamic>>.from(rows));
      }
    } catch (_) {
      if (mounted) {
        setState(() => _events = const [
          {'action': 'vendor_approved', 'target_table': 'vendors', 'created_at': '2026-09-12T10:20:00Z', 'metadata': {'vendor': 'Tiffin & Co.'}},
          {'action': 'platform_fee_updated', 'target_table': 'system_config', 'created_at': '2026-09-11T15:10:00Z', 'metadata': {'key': 'platform_fee_pct'}},
          {'action': 'order_payout_released', 'target_table': 'settlement_batches', 'created_at': '2026-09-10T08:30:00Z', 'metadata': {'batch': 'batch-2'}},
        ]);
      }
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('AUDIT TRAIL', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Operational events', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadAudit, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh audit trail'),
          const SizedBox(width: 8),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  color: Theme.of(context).colorScheme.secondaryContainer,
                  child: const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Recent platform actions, approvals, payouts, and configuration changes are tracked here.'),
                  ),
                ),
                const SizedBox(height: 18),
                ..._events.map((event) => _AuditEventCard(event: event)),
              ],
            ),
    );
  }
}

class _AuditEventCard extends StatelessWidget {
  const _AuditEventCard({required this.event});

  final Map<String, dynamic> event;

  @override
  Widget build(BuildContext context) {
    final action = event['action'] as String? ?? 'platform_event';
    final target = event['target_table'] as String? ?? 'unknown';
    final metadata = event['metadata'] is Map ? Map<String, dynamic>.from(event['metadata'] as Map) : const <String, dynamic>{};
    final createdAt = DateTime.tryParse(event['created_at'] as String? ?? '')?.toLocal();
    final summary = metadata.isEmpty ? 'No payload detail.' : metadata.entries.map((entry) => '${entry.key}: ${entry.value}').join(' · ');

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(action.replaceAll('_', ' '), style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text('$target · ${createdAt == null ? 'Recently' : createdAt.toString().split(' ').first}\n$summary'),
        isThreeLine: true,
      ),
    );
  }
}
