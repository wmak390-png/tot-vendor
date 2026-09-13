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
          .select('id, status, meals_remaining, total_meals, end_date, subscription_plans(name, meal_slots)')
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
                ..._subscriptions.map((sub) => _SubscriptionCard(subscription: sub, onBook: () => _bookMeal(sub))),
              ],
            ),
    );
  }

  Future<void> _bookMeal(Map<String, dynamic> subscription) async {
    final plan = subscription['subscription_plans'] as Map<String, dynamic>?;
    final slots = (plan?['meal_slots'] as List<dynamic>?)?.whereType<Map<String, dynamic>>().toList() ?? const [];
    final slotNames = slots.map((slot) => slot['slot'] as String? ?? 'meal').toList();
    if (slotNames.isEmpty) slotNames.add('lunch');
    var selectedSlot = slotNames.first;
    final now = DateTime.now().add(const Duration(hours: 4));
    final selectedDate = await showDatePicker(context: context, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 60)), initialDate: now);
    if (selectedDate == null || !mounted) return;
    final selectedTime = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(now));
    if (selectedTime == null || !mounted) return;
    final pickupTime = DateTime(selectedDate.year, selectedDate.month, selectedDate.day, selectedTime.hour, selectedTime.minute);
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Reserve a meal'),
          content: DropdownButtonFormField<String>(
            initialValue: selectedSlot,
            decoration: const InputDecoration(labelText: 'Meal slot'),
            items: slotNames.map((slot) => DropdownMenuItem(value: slot, child: Text(slot))).toList(),
            onChanged: (value) => setDialogState(() => selectedSlot = value ?? selectedSlot),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Reserve')),
          ],
        ),
      ),
    );
    if (confirmed != true || !mounted) return;
    final client = SupabaseBootstrap.client;
    if (client == null) return;
    try {
      await client.functions.invoke('book-subscription-meal', body: {
        'subscriptionId': subscription['id'],
        'mealSlot': selectedSlot,
        'pickupTime': pickupTime.toUtc().toIso8601String(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Meal reserved successfully.')));
        _loadSubscriptions();
      }
    } catch (error) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
    }
  }
}

class _SubscriptionCard extends StatelessWidget {
  const _SubscriptionCard({required this.subscription, required this.onBook});

  final Map<String, dynamic> subscription;
  final VoidCallback onBook;

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
            const SizedBox(height: 14),
            SizedBox(width: double.infinity, child: FilledButton.icon(onPressed: remaining > 0 && status == 'ACTIVE' ? onBook : null, icon: const Icon(Icons.event_available_outlined), label: const Text('Reserve a meal'))),
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
