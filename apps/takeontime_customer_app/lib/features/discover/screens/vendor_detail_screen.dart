import 'package:flutter/material.dart';

import '../../orders/data/customer_orders_repository.dart';
import '../data/discovery_repository.dart';

class CustomerMenuItem {
  const CustomerMenuItem({this.id = '', required this.name, required this.description, required this.price, required this.prepMinutes});

  final String id;
  final String name;
  final String description;
  final double price;
  final int prepMinutes;

  factory CustomerMenuItem.fromJson(Map<String, dynamic> json) => CustomerMenuItem(
      id: json['id'] as String? ?? '',
        name: json['name'] as String? ?? 'Menu item',
        description: json['description'] as String? ?? 'Freshly prepared in our kitchen',
        price: ((json['price'] as num?)?.toDouble() ?? ((json['price_paise'] as num?)?.toDouble() ?? 0) / 100),
        prepMinutes: (json['prep_minutes'] as num?)?.toInt() ?? 10,
      );
}

class VendorDetailScreen extends StatefulWidget {
  const VendorDetailScreen({
    super.key,
    required this.vendorId,
    required this.name,
    required this.eta,
    required this.status,
    required this.cuisines,
  });

  final String vendorId;
  final String name;
  final String eta;
  final String status;
  final String cuisines;

  @override
  State<VendorDetailScreen> createState() => _VendorDetailScreenState();
}

class _VendorDetailScreenState extends State<VendorDetailScreen> {
  final _repository = const DiscoveryRepository();
  List<CustomerMenuItem> _items = const [
    CustomerMenuItem(id: 'demo-signature-bowl', name: 'Signature Bowl', description: 'Seasonal vegetables, grains, and house dressing', price: 220, prepMinutes: 12),
    CustomerMenuItem(id: 'demo-tofu-wrap', name: 'Crispy Tofu Wrap', description: 'Crispy tofu, greens, and mint chutney', price: 210, prepMinutes: 10),
    CustomerMenuItem(id: 'demo-mango-bowl', name: 'Mango Rice Bowl', description: 'Mango, basmati rice, and toasted seeds', price: 165, prepMinutes: 8),
  ];
  final _selectedItems = <String>{};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadItems();
  }

  Future<void> _loadItems() async {
    try {
      final rows = await _repository.fetchAvailableItems(widget.vendorId);
      if (mounted && rows.isNotEmpty) setState(() => _items = rows.map(CustomerMenuItem.fromJson).toList());
    } catch (_) {
      // Keep demo menu content available when Supabase is not configured locally.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.name)),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.name, style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 10),
                    Text(widget.cuisines),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 18),
                        const SizedBox(width: 8),
                        Text(widget.eta),
                        const SizedBox(width: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(widget.status),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (_loading) const LinearProgressIndicator(),
            _MenuSection(menuItems: _items, selectedItems: _selectedItems, onToggle: (item) => setState(() => _selectedItems.contains(item.name) ? _selectedItems.remove(item.name) : _selectedItems.add(item.name))),
            const SizedBox(height: 16),
            const _MenuSection(title: 'Add-ons', items: ['Lime soda', 'Coconut water', 'Fruit cup']),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _selectedItems.isEmpty ? null : () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => CheckoutScreen(vendorId: widget.vendorId, items: _items.where((item) => _selectedItems.contains(item.name)).toList()),
                    ),
                  );
                },
                child: Text(_selectedItems.isEmpty ? 'Select items to continue' : 'Go to checkout · ${_selectedItems.length}'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MenuSection extends StatelessWidget {
  const _MenuSection({this.title = 'Available menu', this.items = const [], this.menuItems = const [], this.selectedItems = const {}, this.onToggle});

  final String title;
  final List<String> items;
  final List<CustomerMenuItem> menuItems;
  final Set<String> selectedItems;
  final ValueChanged<CustomerMenuItem>? onToggle;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            ...menuItems.map((item) => InkWell(
                  onTap: onToggle == null ? null : () => onToggle!(item),
                  borderRadius: BorderRadius.circular(8),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Icon(selectedItems.contains(item.name) ? Icons.check_circle : Icons.add_circle_outline, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(item.name, style: const TextStyle(fontWeight: FontWeight.w600)), Text(item.description), Text('₹${item.price.toStringAsFixed(0)} · ${item.prepMinutes} min prep', style: const TextStyle(color: Colors.grey))])),
                    ]),
                  ),
                )),
            ...items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_outline, size: 18),
                  const SizedBox(width: 8),
                  Expanded(child: Text(item)),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key, this.vendorId = 'demo-vendor-1', this.items = const [
    CustomerMenuItem(id: 'demo-classic-bowl', name: 'Classic Bowl', description: '', price: 220, prepMinutes: 10),
    CustomerMenuItem(id: 'demo-coconut-curry', name: 'Coconut Curry', description: '', price: 240, prepMinutes: 10),
  ]});

  final String vendorId;
  final List<CustomerMenuItem> items;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Order summary', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              ...items.map((item) => _SummaryRow(label: item.name, value: '₹${item.price.toStringAsFixed(0)}')),
              const Divider(),
              _SummaryRow(label: 'Subtotal', value: '₹${items.fold<double>(0, (total, item) => total + item.price).toStringAsFixed(0)}'),
              const _SummaryRow(label: 'Pickup', value: '₹0'),
              _SummaryRow(label: 'Total', value: '₹${items.fold<double>(0, (total, item) => total + item.price).toStringAsFixed(0)}'),
              const SizedBox(height: 16),
              const Text('Payment method: UPI / Cash / Card'),
              const Spacer(),
              SizedBox(
                width: double.infinity,
                child: _PlaceOrderButton(vendorId: vendorId, items: items),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _PlaceOrderButton extends StatefulWidget {
  const _PlaceOrderButton({required this.vendorId, required this.items});

  final String vendorId;
  final List<CustomerMenuItem> items;

  @override
  State<_PlaceOrderButton> createState() => _PlaceOrderButtonState();
}

class _PlaceOrderButtonState extends State<_PlaceOrderButton> {
  final _repository = const CustomerOrdersRepository();
  late final String _idempotencyKey = 'checkout-${DateTime.now().toUtc().microsecondsSinceEpoch}';
  bool _saving = false;

  Future<void> _placeOrder() async {
    setState(() => _saving = true);
    try {
      await _repository.createOrder(
        vendorId: widget.vendorId,
        itemIds: widget.items.map((item) => item.id).where((id) => id.isNotEmpty).toList(),
        idempotencyKey: _idempotencyKey,
      );
      if (mounted) Navigator.of(context).popUntil((route) => route.isFirst);
    } catch (error) {
      if (mounted) {
        setState(() => _saving = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString().replaceFirst('Bad state: ', ''))));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: _saving ? null : _placeOrder,
      child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Place order'),
    );
  }
}
