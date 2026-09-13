import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  bool _loading = true;
  double _grossRevenue = 240000;
  double _netPayout = 180000;
  final List<Map<String, dynamic>> _batches = [
    {'label': 'Processing', 'value': '₹84,260', 'status': 'Pending'},
    {'label': 'Released', 'value': '₹1,28,640', 'status': 'Paid'},
    {'label': 'Refunds', 'value': '₹3,440', 'status': 'Review'},
  ];

  @override
  void initState() {
    super.initState();
    _loadFinance();
  }

  Future<void> _loadFinance() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final settlementRows = await client
          .from('settlement_batches')
          .select('id, total_amount_paise, status, created_at')
          .order('created_at', ascending: false)
          .limit(25);

      final walletRows = await client
          .from('wallet_transactions')
          .select('id, type, amount_paise, reference_type, created_at')
          .order('created_at', ascending: false)
          .limit(100);

      if (mounted) {
        final settlementTotal = settlementRows.fold<int>(0, (sum, row) {
          final amount = row['total_amount_paise'] as num? ?? 0;
          return sum + amount.toInt();
        });

        final grossRevenue = walletRows.where((row) => (row['type'] as String? ?? '') == 'credit').fold<int>(0, (sum, row) {
          return sum + ((row['amount_paise'] as num?)?.toInt() ?? 0);
        });

        final refunds = walletRows.where((row) => (row['reference_type'] as String? ?? '') == 'refund').fold<int>(0, (sum, row) {
          return sum + ((row['amount_paise'] as num?)?.toInt() ?? 0);
        });

        final pending = settlementRows.where((row) => (row['status'] as String? ?? '') == 'pending').fold<int>(0, (sum, row) {
          return sum + ((row['total_amount_paise'] as num?)?.toInt() ?? 0);
        });

        final released = settlementRows.where((row) => (row['status'] as String? ?? '') == 'paid').fold<int>(0, (sum, row) {
          return sum + ((row['total_amount_paise'] as num?)?.toInt() ?? 0);
        });

        setState(() {
          _grossRevenue = grossRevenue / 100;
          _netPayout = (settlementTotal - refunds) / 100;
          _loading = false;
        });

        final batches = <Map<String, dynamic>>[
          {'label': 'Processing', 'value': '₹${_formatMoney(pending / 100)}', 'status': pending > 0 ? 'Pending' : 'Clear'},
          {'label': 'Released', 'value': '₹${_formatMoney(released / 100)}', 'status': released > 0 ? 'Paid' : 'Waiting'},
          {'label': 'Refunds', 'value': '₹${_formatMoney(refunds / 100)}', 'status': refunds > 0 ? 'Review' : 'Healthy'},
        ];

        if (mounted) {
          setState(() {
            _batches.clear();
            _batches.addAll(batches);
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<Map<String, dynamic>> get _effectiveBatches => _batches;

  @override
  Widget build(BuildContext context) {
    final batches = _effectiveBatches;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('FINANCE', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Settlement overview', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(
                  children: [
                    Expanded(child: _MetricCard(label: 'Gross revenue', value: '₹${_formatCurrency(_grossRevenue)}')),
                    const SizedBox(width: 12),
                    Expanded(child: _MetricCard(label: 'Net payout', value: '₹${_formatCurrency(_netPayout)}')),
                  ],
                ),
                const SizedBox(height: 20),
                ...batches.map((batch) => Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text(batch['label'] as String),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(batch['value'] as String, style: const TextStyle(fontWeight: FontWeight.w800)),
                            const SizedBox(height: 4),
                            Text(batch['status'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    )),
              ],
            ),
    );
  }

  static String _formatCurrency(double value) {
    if (value >= 100000) {
      return '${(value / 100000).toStringAsFixed(value >= 1000000 ? 1 : 2)}L';
    }
    return value.toStringAsFixed(0);
  }

  static String _formatMoney(double value) {
    if (value >= 100000) {
      return '${(value / 100000).toStringAsFixed(value >= 1000000 ? 1 : 2)}L';
    }
    final whole = value.round();
    final withCommas = whole.toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (match) => ',',
    );
    return withCommas;
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelMedium),
            const SizedBox(height: 8),
            Text(value, style: Theme.of(context).textTheme.headlineSmall),
          ],
        ),
      ),
    );
  }
}
