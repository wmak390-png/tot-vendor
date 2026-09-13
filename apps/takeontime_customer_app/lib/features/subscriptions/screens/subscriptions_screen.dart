import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  bool _loading = true;
  List<Map<String, dynamic>> _subscriptions = const [
    {'id': 'sub-1', 'status': 'active', 'meals_remaining': 8, 'total_meals': 20, 'end_date': '2026-09-30', 'plan_name': 'Office Lunch Pass'},
    {'id': 'sub-2', 'status': 'active', 'meals_remaining': 5, 'total_meals': 10, 'end_date': '2026-09-18', 'plan_name': 'Gym Fuel Plan'},
  ];

  @override
  void initState() {
    super.initState();
    _loadSubscriptions();
  }

  Future<void> _loadSubscriptions() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      if (mounted) {
        setState(() => _loading = false);
      }
      return;
    }

    try {
      final rows = await client
          .from('user_subscriptions')
          .select('id, status, meals_remaining, total_meals, end_date, subscription_plans(name)')
          .eq('user_id', client.auth.currentUser?.id ?? '');
      if (mounted) {
        setState(() => _subscriptions = List<Map<String, dynamic>>.from(rows));
      }
    } catch (_) {
      if (mounted) {
        setState(() => _subscriptions = const [
          {'id': 'sub-1', 'status': 'active', 'meals_remaining': 8, 'total_meals': 20, 'end_date': '2026-09-30', 'plan_name': 'Office Lunch Pass'},
          {'id': 'sub-2', 'status': 'active', 'meals_remaining': 5, 'total_meals': 10, 'end_date': '2026-09-18', 'plan_name': 'Gym Fuel Plan'},
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
            Text('MEMBERSHIP', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('My subscriptions', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadSubscriptions, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh plan status'),
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
                        const Text('Meal pass summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        const SizedBox(height: 8),
                        Text('${_subscriptions.fold<int>(0, (sum, sub) => sum + ((sub['meals_remaining'] as num?)?.toInt() ?? 0))} meals left across ${_subscriptions.length} active plans.',
                            style: Theme.of(context).textTheme.bodyMedium),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                ..._subscriptions.map((sub) => _SubscriptionCard(subscription: sub)),
              ],
            ),
    );
  }
}

class _SubscriptionCard extends StatelessWidget {
  const _SubscriptionCard({required this.subscription});

  final Map<String, dynamic> subscription;

  @override
  Widget build(BuildContext context) {
    final total = ((subscription['total_meals'] as num?)?.toInt() ?? 0);
    final remaining = ((subscription['meals_remaining'] as num?)?.toInt() ?? 0);
    final name = (subscription['plan_name'] as String?) ?? ((subscription['subscription_plans'] as Map<String, dynamic>?)?['name'] as String?) ?? 'Meal plan';
    final status = (subscription['status'] as String? ?? 'active').toUpperCase();
    final endDate = DateTime.tryParse(subscription['end_date'] as String? ?? '')?.toLocal();

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
                  child: Text(status, style: const TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _ProgressPill(label: '$remaining/$total meals left')),
                const SizedBox(width: 8),
                Text(endDate == null ? 'Valid soon' : 'Valid till ${endDate.day}/${endDate.month}', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ProgressPill extends StatelessWidget {
  const _ProgressPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}
