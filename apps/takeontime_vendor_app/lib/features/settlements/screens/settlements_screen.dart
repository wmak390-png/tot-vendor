import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class SettlementsScreen extends StatefulWidget {
  const SettlementsScreen({super.key});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _batches = const [
    {'id': 'batch-1', 'status': 'pending', 'total_amount_paise': 125000, 'created_at': '2026-09-12T09:00:00Z', 'vendors': {'business_name': 'Tiffin & Co.'}},
    {'id': 'batch-2', 'status': 'paid', 'total_amount_paise': 98000, 'created_at': '2026-09-10T09:00:00Z', 'vendors': {'business_name': 'Tiffin & Co.'}},
  ];

  @override
  void initState() {
    super.initState();
    _loadSettlements();
  }

  Future<void> _loadSettlements() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      if (mounted) {
        setState(() => _loading = false);
      }
      return;
    }

    try {
      final rows = await client
          .from('settlement_batches')
          .select('id, total_amount_paise, status, created_at, vendors(business_name)')
          .order('created_at', ascending: false);
      if (mounted) {
        setState(() => _batches = List<Map<String, dynamic>>.from(rows));
      }
    } catch (_) {
      if (mounted) {
        setState(() => _batches = const [
          {'id': 'batch-1', 'status': 'pending', 'total_amount_paise': 125000, 'created_at': '2026-09-12T09:00:00Z', 'vendors': {'business_name': 'Tiffin & Co.'}},
          {'id': 'batch-2', 'status': 'paid', 'total_amount_paise': 98000, 'created_at': '2026-09-10T09:00:00Z', 'vendors': {'business_name': 'Tiffin & Co.'}},
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
    final pending = _batches.where((batch) => (batch['status'] as String? ?? 'pending') == 'pending').length;
    final total = _batches.fold<int>(0, (sum, batch) => sum + ((batch['total_amount_paise'] as num?)?.toInt() ?? 0));

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('SETTLEMENTS', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Payouts', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadSettlements, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh settlements'),
          const SizedBox(width: 8),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Settlement balance', style: Theme.of(context).textTheme.labelLarge),
                        const SizedBox(height: 8),
                        Text('₹${(total / 100).toStringAsFixed(0)}', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 6),
                        Text('$pending batch(es) awaiting payout', style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ..._batches.map((batch) => _SettlementBatchCard(batch: batch)),
              ],
            ),
    );
  }
}

class _SettlementBatchCard extends StatelessWidget {
  const _SettlementBatchCard({required this.batch});

  final Map<String, dynamic> batch;

  @override
  Widget build(BuildContext context) {
    final status = (batch['status'] as String? ?? 'pending').toUpperCase();
    final amount = ((batch['total_amount_paise'] as num?)?.toInt() ?? 0) / 100;
    final vendor = (batch['vendors'] as Map<String, dynamic>?)?['business_name'] as String? ?? 'TakeOnTime vendor';
    final createdAt = DateTime.tryParse(batch['created_at'] as String? ?? '')?.toLocal();

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(vendor, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text('${createdAt == null ? 'Recent schedule' : createdAt.toString().split(' ').first} · $status'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text('₹${amount.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w800)),
            const SizedBox(height: 4),
            Text(status, style: TextStyle(fontSize: 11, color: status == 'PAID' ? Colors.green : Colors.orange, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}
