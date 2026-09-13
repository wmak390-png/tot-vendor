import 'package:flutter/material.dart';

import '../data/vendor_operations_repository.dart';

const _fallbackVendorId = 'demo-vendor-1';

class StoreScreen extends StatefulWidget {
  const StoreScreen({super.key});

  @override
  State<StoreScreen> createState() => _StoreScreenState();
}

class _StoreScreenState extends State<StoreScreen> {
  final _repository = const VendorOperationsRepository();
  String _vendorId = _fallbackVendorId;
  bool _acceptingOrders = true;
  DateTime? _breakUntil;
  String _businessName = 'Tiffin & Co.';
  bool _loading = true;
  bool _saving = false;

  bool get _onBreak => _breakUntil != null && _breakUntil!.isAfter(DateTime.now());

  @override
  void initState() {
    super.initState();
    _loadStore();
  }

  Future<void> _loadStore() async {
    try {
      final resolvedVendorId = await _repository.resolveVendorId(fallback: _fallbackVendorId);
      if (resolvedVendorId == null || resolvedVendorId.isEmpty) {
        if (mounted) setState(() => _loading = false);
        return;
      }
      _vendorId = resolvedVendorId;
      final snapshot = await _repository.fetchSnapshot(_vendorId);
      final vendor = snapshot?['vendor'] as Map<String, dynamic>?;
      if (vendor != null && mounted) {
        setState(() {
          _acceptingOrders = vendor['accepting_orders'] as bool? ?? true;
          _breakUntil = _parseDate(vendor['break_until']);
          _businessName = vendor['business_name'] as String? ?? _businessName;
          _loading = false;
        });
      } else if (mounted) {
        setState(() => _loading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  DateTime? _parseDate(Object? value) {
    if (value is! String) return null;
    return DateTime.tryParse(value)?.toLocal();
  }

  Future<void> _save({bool? acceptingOrders, DateTime? breakUntil, bool clearBreak = false}) async {
    final previousAcceptingOrders = _acceptingOrders;
    final previousBreakUntil = _breakUntil;
    setState(() {
      _acceptingOrders = acceptingOrders ?? _acceptingOrders;
      _breakUntil = clearBreak ? null : breakUntil ?? _breakUntil;
      _saving = true;
    });
    try {
      await _repository.updateStore(vendorId: _vendorId, acceptingOrders: _acceptingOrders, breakUntil: _breakUntil);
      if (mounted) setState(() => _saving = false);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _acceptingOrders = previousAcceptingOrders;
        _breakUntil = previousBreakUntil;
        _saving = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not update store status.')));
    }
  }

  Future<void> _chooseBreak() async {
    final duration = await showModalBottomSheet<Duration>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const ListTile(title: Text('Take a temporary break'), subtitle: Text('Customers will see the store as unavailable.')),
          for (final option in const [
            (label: '15 minutes', duration: Duration(minutes: 15)),
            (label: '30 minutes', duration: Duration(minutes: 30)),
            (label: '1 hour', duration: Duration(hours: 1)),
          ])
            ListTile(title: Text(option.label), trailing: const Icon(Icons.chevron_right), onTap: () => Navigator.pop(context, option.duration)),
          const SizedBox(height: 8),
        ]),
      ),
    );
    if (duration != null) await _save(breakUntil: DateTime.now().add(duration));
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    final status = _onBreak ? 'On break' : _acceptingOrders ? 'Open' : 'Closed';
    final statusColor = _onBreak ? Colors.orange : _acceptingOrders ? Colors.green : Colors.red;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('STORE OPERATIONS', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text(_businessName, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [IconButton(onPressed: _loadStore, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh store data'), const SizedBox(width: 8)],
      ),
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(children: [
                Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(15)), child: Icon(Icons.storefront_rounded, color: statusColor)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(status, style: Theme.of(context).textTheme.titleLarge), Text(_onBreak ? 'Reopens ${_formatTime(_breakUntil!)}' : _acceptingOrders ? 'Customers can place orders' : 'Orders are paused', style: Theme.of(context).textTheme.bodyMedium)])),
                Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6), decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)), child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w800))),
                if (_saving) const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
              ]),
            ),
          ),
          const SizedBox(height: 12),
          Card(child: SwitchListTile(value: _acceptingOrders, title: const Text('Accepting orders'), subtitle: Text(_acceptingOrders ? 'Live now' : 'Closed to new orders'), onChanged: _saving ? null : (value) => _save(acceptingOrders: value))),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: Icon(_onBreak ? Icons.timer_outlined : Icons.access_time),
              title: Text(_onBreak ? 'Temporary break active' : 'Take a temporary break'),
              subtitle: Text(_onBreak ? 'Ends ${_formatTime(_breakUntil!)}' : 'Pause orders for a short time'),
              trailing: _onBreak ? TextButton(onPressed: _saving ? null : () => _save(clearBreak: true), child: const Text('End')) : const Icon(Icons.chevron_right),
              onTap: _onBreak || _saving ? null : _chooseBreak,
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.storefront_outlined),
              title: Text(_businessName),
              subtitle: Text('Store profile · ${_acceptingOrders ? 'Accepting orders' : 'Orders paused'}'),
              trailing: const Icon(Icons.edit_outlined),
            ),
          ),
          const SizedBox(height: 12),
          Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [Text('Store health', style: TextStyle(fontWeight: FontWeight.w700)), SizedBox(height: 12), Row(children: [Expanded(child: _MetricChip(label: 'Prep time', value: '18m')), SizedBox(width: 8), Expanded(child: _MetricChip(label: 'Fulfillment', value: '96%'))])]))),
        ]),
      ),
    );
  }

  String _formatTime(DateTime time) => MaterialLocalizations.of(context).formatTimeOfDay(TimeOfDay.fromDateTime(time));
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label, style: Theme.of(context).textTheme.labelMedium), const SizedBox(height: 6), Text(value, style: Theme.of(context).textTheme.titleMedium)]),
    );
  }
}
