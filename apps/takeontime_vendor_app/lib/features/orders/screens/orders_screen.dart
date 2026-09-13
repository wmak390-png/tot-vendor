import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';
import '../../store/data/vendor_operations_repository.dart';

const _fallbackVendorId = 'demo-vendor-1';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _repository = const VendorOperationsRepository();
  String _vendorId = _fallbackVendorId;
  List<VendorOrder> _orders = SupabaseBootstrap.client == null ? const [
    VendorOrder(id: 'TT-4821', customer: 'Aarav Mehta', item: 'Paneer Tikka Bowl', quantity: 2, amountPaise: 43800, status: 'New', time: '2 min ago', pickup: '12:30 – 12:45 PM', note: 'Less spicy, please'),
    VendorOrder(id: 'TT-4818', customer: 'Meera Shah', item: 'Cold Brew + Masala Omelette', quantity: 1, amountPaise: 26800, status: 'Preparing', time: '18 min ago', pickup: '12:15 – 12:30 PM'),
    VendorOrder(id: 'TT-4812', customer: 'Rohan Kapoor', item: 'Dal Makhani Combo', quantity: 1, amountPaise: 16900, status: 'Ready', time: '32 min ago', pickup: '12:00 – 12:15 PM'),
  ] : const [];
  String _filter = 'All';
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    try {
      final resolvedVendorId = await _repository.resolveVendorId(fallback: _fallbackVendorId);
      if (resolvedVendorId == null || resolvedVendorId.isEmpty) {
        if (mounted) setState(() => _loading = false);
        return;
      }
      final orders = await _repository.fetchOrders(resolvedVendorId);
      _vendorId = resolvedVendorId;
      if (mounted && orders.isNotEmpty) setState(() => _orders = orders);
    } catch (_) {
      // Keep the demo queue available when Supabase is not configured locally.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  List<VendorOrder> get _visibleOrders => _orders.where((order) => _filter == 'All' || order.status == _filter).toList();

  Future<void> _advance(VendorOrder order) async {
    final next = switch (order.status) {
      'New' => 'Accepted',
      'Accepted' => 'Preparing',
      'Preparing' => 'Ready',
      'Ready' => 'Completed',
      _ => order.status,
    };
    if (next == order.status) return;
    final index = _orders.indexWhere((candidate) => candidate.id == order.id);
    setState(() => _orders[index] = order.copyWith(status: next));
    try {
      final updated = await _repository.updateOrderStatus(vendorId: _vendorId, order: order, status: next);
      if (mounted) setState(() => _orders[index] = updated);
    } catch (_) {
      if (mounted) {
        setState(() => _orders[index] = order);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not update the live order.')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final active = _orders.where((order) => order.status != 'Completed').length;
    final ready = _orders.where((order) => order.status == 'Ready').length;
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('KITCHEN QUEUE', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Orders', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [IconButton(onPressed: _loadOrders, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh orders'), const SizedBox(width: 8)],
      ),
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Wrap(spacing: 8, runSpacing: 8, children: [for (final filter in ['All', 'New', 'Preparing', 'Ready', 'Completed']) ChoiceChip(label: Text(filter), selected: _filter == filter, onSelected: (_) => setState(() => _filter = filter))]),
          const SizedBox(height: 16),
          Card(child: ListTile(leading: const Icon(Icons.local_fire_department_outlined), title: const Text('Live queue'), subtitle: Text('$active active orders · $ready ready for pickup'))),
          const SizedBox(height: 12),
          Card(child: const ListTile(leading: Icon(Icons.store_mall_directory_outlined), title: Text('Pickup board'), subtitle: Text('Keep ready orders visible for the handoff team.'))),
          const SizedBox(height: 12),
          if (_loading) const LinearProgressIndicator(),
          if (!_loading && _visibleOrders.isEmpty) const Card(child: ListTile(title: Text('No matching orders'), subtitle: Text('Try another status filter.'))),
          ..._visibleOrders.map((order) => _OrderCard(order: order, onAdvance: () => _advance(order))),
        ]),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order, required this.onAdvance});

  final VendorOrder order;
  final VoidCallback onAdvance;

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (order.status) {
      'Ready' => Colors.green,
      'New' || 'Accepted' || 'Preparing' => Colors.orange,
      _ => Colors.grey,
    };
    return Card(
      child: ListTile(
        onTap: () async {
          final verified = await Navigator.of(context).push<bool>(MaterialPageRoute<bool>(builder: (_) => OrderDetailScreen(order: order, onAdvance: onAdvance)));
          if (!context.mounted) return;
          if (verified == true) await (context.findAncestorStateOfType<_OrdersScreenState>()?._loadOrders() ?? Future<void>.value());
        },
        title: Text('#${order.id} · ${order.customer}'),
        subtitle: Text('${order.quantity} × ${order.item}\nPickup ${order.pickup}'),
        isThreeLine: true,
        trailing: Column(mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.end, children: [Text('₹${(order.amountPaise / 100).toStringAsFixed(0)}', style: Theme.of(context).textTheme.titleMedium), const SizedBox(height: 4), Container(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5), decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(999)), child: Text(order.status, style: TextStyle(color: statusColor, fontWeight: FontWeight.w800, fontSize: 11))) ]),
      ),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.order, required this.onAdvance});

  final VendorOrder order;
  final VoidCallback onAdvance;

  String? get nextStatus => switch (order.status) {
        'New' => 'Accepted',
        'Accepted' => 'Preparing',
        'Preparing' => 'Ready',
        'Ready' => 'Completed',
        _ => null,
      };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('#${order.id}')),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(order.customer, style: Theme.of(context).textTheme.titleLarge), const SizedBox(height: 8), Text('${order.quantity} × ${order.item}'), const SizedBox(height: 8), Text('Total: ₹${(order.amountPaise / 100).toStringAsFixed(0)}'), Text('Pickup: ${order.pickup}'), if (order.note != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text('Note: ${order.note}'))]))),
        const SizedBox(height: 16),
        Text('Status: ${order.status}', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        if (order.status == 'Ready')
          _VerifyPickupButton(orderId: order.id, onVerified: () => Navigator.pop(context, true))
        else if (nextStatus != null)
          FilledButton.icon(onPressed: () { onAdvance(); Navigator.pop(context); }, icon: const Icon(Icons.arrow_forward), label: Text('Mark as $nextStatus'))
        else
          const Text('Order complete'),
      ]),
    );
  }
}

class _VerifyPickupButton extends StatefulWidget {
  const _VerifyPickupButton({required this.orderId, required this.onVerified});

  final String orderId;
  final VoidCallback onVerified;

  @override
  State<_VerifyPickupButton> createState() => _VerifyPickupButtonState();
}

class _VerifyPickupButtonState extends State<_VerifyPickupButton> {
  bool _saving = false;

  Future<void> _verify() async {
    final codeController = TextEditingController();
    final code = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Verify pickup'),
        content: TextField(controller: codeController, autofocus: true, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Pickup OTP', border: OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, codeController.text.trim()), child: const Text('Verify')),
        ],
      ),
    );
    codeController.dispose();
    if (code == null || code.isEmpty || !mounted) return;
    final client = SupabaseBootstrap.client;
    if (client == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Connect Supabase to verify pickup.')));
      return;
    }
    setState(() => _saving = true);
    try {
      await client.functions.invoke('verify-pickup', body: {'orderId': widget.orderId, 'code': code});
      if (mounted) widget.onVerified();
    } catch (error) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
      }
    }
  }

  @override
  Widget build(BuildContext context) => FilledButton.icon(onPressed: _saving ? null : _verify, icon: _saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.verified_outlined), label: Text(_saving ? 'Verifying...' : 'Verify pickup OTP'));
}
