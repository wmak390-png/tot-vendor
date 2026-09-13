import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  List<Map<String, dynamic>> _plans = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      setState(() {
        _plans = const [];
        _loading = false;
      });
      return;
    }
    try {
      final rows = await client.from('subscription_plans').select('id, name, description, total_meals, duration_days, daily_limit, base_price_paise, meal_slots, vendors(business_name, gst_registered)').eq('is_active', true).order('created_at', ascending: false);
      if (mounted) setState(() => _plans = rows.map((row) => Map<String, dynamic>.from(row)).toList());
    } catch (_) {
      if (mounted) setState(() => _error = 'Plans could not be loaded.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('MEAL PLANS', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
          SizedBox(height: 2),
          Text('Eat on your schedule', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        ]),
        actions: [IconButton(onPressed: _loadPlans, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh meal plans'), const SizedBox(width: 8)],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            color: Theme.of(context).colorScheme.primaryContainer,
            child: const Padding(padding: EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('One pass. Your regular meals covered.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), SizedBox(height: 6), Text('Prepay for a meal plan, then reserve lunch or dinner slots when you need them.')])) ,
          ),
          const SizedBox(height: 20),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null) _StateCard(icon: Icons.error_outline_rounded, title: 'Could not load plans', message: _error!, action: _loadPlans),
          if (!_loading && _error == null && _plans.isEmpty) const _StateCard(icon: Icons.calendar_month_outlined, title: 'No active plans yet', message: 'Approved vendors will publish meal passes here.'),
          ..._plans.map((plan) => _PlanCard(plan: plan)),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan});

  final Map<String, dynamic> plan;

  @override
  Widget build(BuildContext context) {
    final vendor = plan['vendors'] as Map<String, dynamic>?;
    final price = ((plan['base_price_paise'] as num?)?.toInt() ?? 0) / 100;
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [Expanded(child: Text(plan['name'] as String? ?? 'Meal plan', style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800))), Text('₹${price.toStringAsFixed(0)}', style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 18, fontWeight: FontWeight.w900))]),
          const SizedBox(height: 6),
          Text(vendor?['business_name'] as String? ?? 'TakeOnTime vendor', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 10),
          Text(plan['description'] as String? ?? 'Flexible meals for your regular routine.'),
          const SizedBox(height: 14),
          Wrap(spacing: 8, runSpacing: 8, children: [
            _PlanPill(icon: Icons.restaurant_rounded, label: '${plan['total_meals'] ?? 0} meals'),
            _PlanPill(icon: Icons.date_range_rounded, label: '${plan['duration_days'] ?? 0} days'),
            _PlanPill(icon: Icons.today_rounded, label: '${plan['daily_limit'] ?? 0}/day'),
          ]),
          const SizedBox(height: 14),
          SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: () {}, icon: const Icon(Icons.arrow_forward_rounded), label: const Text('View plan'))),
        ]),
      ),
    );
  }
}

class _PlanPill extends StatelessWidget {
  const _PlanPill({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(999)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 14),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}

class _StateCard extends StatelessWidget {
  const _StateCard({required this.icon, required this.title, required this.message, this.action});
  final IconData icon;
  final String title;
  final String message;
  final VoidCallback? action;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          Icon(icon, size: 32, color: Theme.of(context).colorScheme.primary),
          const SizedBox(height: 10),
          Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 6),
          Text(message, textAlign: TextAlign.center),
          if (action != null) ...[
            const SizedBox(height: 12),
            OutlinedButton(onPressed: action, child: const Text('Retry')),
          ],
        ]),
      ),
    );
  }
}
