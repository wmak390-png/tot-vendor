import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';
import '../../store/data/vendor_operations_repository.dart';

class PlansScreen extends StatefulWidget {
  const PlansScreen({super.key});

  @override
  State<PlansScreen> createState() => _PlansScreenState();
}

class _PlansScreenState extends State<PlansScreen> {
  final _repository = const VendorOperationsRepository();
  List<Map<String, dynamic>> _plans = const [];
  String? _vendorId;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPlans();
  }

  Future<void> _loadPlans() async {
    try {
      final vendorId = await _repository.resolveVendorId();
      if (vendorId == null || SupabaseBootstrap.client == null) return;
      _vendorId = vendorId;
      final rows = await SupabaseBootstrap.client!.from('subscription_plans').select().eq('vendor_id', vendorId).order('created_at', ascending: false);
      if (mounted) setState(() => _plans = rows.map((row) => Map<String, dynamic>.from(row)).toList());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _createPlan() async {
    final name = TextEditingController();
    final meals = TextEditingController(text: '20');
    final days = TextEditingController(text: '30');
    final price = TextEditingController();
    final values = await showModalBottomSheet<List<String>>(context: context, isScrollControlled: true, builder: (context) => Padding(padding: EdgeInsets.fromLTRB(16, 20, 16, MediaQuery.viewInsetsOf(context).bottom + 16), child: Column(mainAxisSize: MainAxisSize.min, children: [Text('Create meal plan', style: Theme.of(context).textTheme.titleLarge), const SizedBox(height: 16), TextField(controller: name, decoration: const InputDecoration(labelText: 'Plan name')), const SizedBox(height: 10), Row(children: [Expanded(child: TextField(controller: meals, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Meals'))), const SizedBox(width: 10), Expanded(child: TextField(controller: days, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Validity days')))]), const SizedBox(height: 10), TextField(controller: price, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: const InputDecoration(labelText: 'Base price (₹)')), const SizedBox(height: 16), SizedBox(width: double.infinity, child: FilledButton(onPressed: () => Navigator.pop(context, [name.text.trim(), meals.text.trim(), days.text.trim(), price.text.trim()]), child: const Text('Save plan')))])));
    name.dispose();
    meals.dispose();
    days.dispose();
    price.dispose();
    if (values == null || _vendorId == null || values[0].isEmpty) return;
    final client = SupabaseBootstrap.client;
    if (client == null) return;
    final mealCount = int.tryParse(values[1]);
    final duration = int.tryParse(values[2]);
    final basePrice = double.tryParse(values[3]);
    if (mealCount == null || duration == null || basePrice == null || mealCount < 1 || duration < 1 || basePrice < 0) return;
    await client.from('subscription_plans').insert({'vendor_id': _vendorId, 'name': values[0], 'total_meals': mealCount, 'duration_days': duration, 'daily_limit': 1, 'base_price_paise': (basePrice * 100).round(), 'meal_slots': [{'slot': 'lunch', 'description': 'Daily lunch meal'}], 'is_active': true});
    await _loadPlans();
  }

  @override
  Widget build(BuildContext context) => Scaffold(appBar: AppBar(titleSpacing: 16, title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('MEAL PLANS', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)), SizedBox(height: 2), Text('Subscription plans', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))]), actions: [IconButton(onPressed: _loadPlans, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh plans'), const SizedBox(width: 8)]), floatingActionButton: FloatingActionButton.extended(onPressed: _createPlan, icon: const Icon(Icons.add_rounded), label: const Text('Create plan')), body: ListView(padding: const EdgeInsets.all(16), children: [_IntroCard(), if (_loading) const LinearProgressIndicator(), if (!_loading && _plans.isEmpty) const _EmptyPlans(), ..._plans.map((plan) => _PlanCard(plan: plan))]));
}

class _IntroCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Card(color: Theme.of(context).colorScheme.primaryContainer, child: const Padding(padding: EdgeInsets.all(18), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('Create a predictable meal rhythm.', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)), SizedBox(height: 6), Text('Plans are prepaid, time-bound, and visible to customers only while active.')])));
}

class _EmptyPlans extends StatelessWidget {
  const _EmptyPlans();
  @override
  Widget build(BuildContext context) => const Card(child: Padding(padding: EdgeInsets.all(24), child: Column(children: [Icon(Icons.calendar_month_outlined, size: 32), SizedBox(height: 10), Text('No meal plans yet', style: TextStyle(fontWeight: FontWeight.w800)), SizedBox(height: 6), Text('Create your first plan to serve regular customers.', textAlign: TextAlign.center)])));
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan});
  final Map<String, dynamic> plan;
  @override
  Widget build(BuildContext context) => Card(margin: const EdgeInsets.only(top: 12), child: ListTile(contentPadding: const EdgeInsets.all(16), title: Text(plan['name'] as String? ?? 'Meal plan', style: const TextStyle(fontWeight: FontWeight.w800)), subtitle: Text('${plan['total_meals'] ?? 0} meals · ${plan['duration_days'] ?? 0} days · ₹${((plan['base_price_paise'] as num?)?.toInt() ?? 0) ~/ 100}'), trailing: Text(plan['is_active'] == true ? 'Active' : 'Paused', style: TextStyle(color: plan['is_active'] == true ? Colors.green : Colors.grey, fontWeight: FontWeight.w800))));
}
