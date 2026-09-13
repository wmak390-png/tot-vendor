import 'package:flutter/material.dart';

import '../../../core/services/customer_app_service.dart';
import '../../../core/supabase/supabase_bootstrap.dart';
import '../data/discovery_repository.dart';
import 'vendor_detail_screen.dart';

class _DiscoveryVendor {
  const _DiscoveryVendor({required this.id, required this.name, required this.cuisines, required this.acceptingOrders, this.breakUntil});

  final String id;
  final String name;
  final String cuisines;
  final bool acceptingOrders;
  final DateTime? breakUntil;

  bool get onBreak => breakUntil != null && breakUntil!.isAfter(DateTime.now());
  bool get isOpen => acceptingOrders && !onBreak;
  String get status => onBreak ? 'On break' : acceptingOrders ? 'Open' : 'Closed';
  String get eta => onBreak ? 'Reopens ${_time(breakUntil!)}' : isOpen ? 'Ready in 18 mins' : 'Not accepting orders';

  static String _time(DateTime value) => '${value.hour == 0 ? 12 : value.hour > 12 ? value.hour - 12 : value.hour}:${value.minute.toString().padLeft(2, '0')} ${value.hour >= 12 ? 'PM' : 'AM'}';
}

class DiscoverScreen extends StatefulWidget {
  const DiscoverScreen({super.key});

  @override
  State<DiscoverScreen> createState() => _DiscoverScreenState();
}

class _DiscoverScreenState extends State<DiscoverScreen> {
  final _repository = const DiscoveryRepository();
  final _service = const CustomerAppService();
  List<_DiscoveryVendor> _vendors = const [];
  bool _loading = true;
  String _searchQuery = '';
  String? _selectedFilter;
  String _pickupLocation = '16th Main, Bengaluru';

  @override
  void initState() {
    super.initState();
    _vendors = SupabaseBootstrap.client == null ? _service.vendors
        .map((vendor) => _DiscoveryVendor(
              id: vendor.id,
              name: vendor.name,
              cuisines: vendor.cuisines,
              acceptingOrders: vendor.status == 'Open',
            ))
        .toList() : const [];
    _loadVendors();
  }

  Future<void> _loadVendors() async {
    try {
      final rows = await _repository.fetchApprovedVendors();
      final vendors = rows.map((row) => _DiscoveryVendor(
        id: row['id'] as String,
        name: row['business_name'] as String? ?? 'Vendor',
        cuisines: row['business_type'] as String? ?? 'Fresh meals',
        acceptingOrders: row['accepting_orders'] as bool? ?? true,
        breakUntil: DateTime.tryParse(row['break_until'] as String? ?? '')?.toLocal(),
      )).toList();
      if (mounted && vendors.isNotEmpty) setState(() => _vendors = vendors);
    } catch (_) {
      if (mounted && SupabaseBootstrap.client != null) setState(() => _vendors = const []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _choosePickupLocation() async {
    final controller = TextEditingController(text: _pickupLocation);
    final location = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pickup location'),
        content: TextField(controller: controller, autofocus: true, decoration: const InputDecoration(labelText: 'Address or landmark', border: OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Use location')),
        ],
      ),
    );
    controller.dispose();
    if (location == null || location.isEmpty || !mounted) return;
    setState(() => _pickupLocation = location);
  }

  @override
  Widget build(BuildContext context) {
    final filteredVendors = _vendors.where((vendor) {
      final query = _searchQuery.trim().toLowerCase();
      final matchesQuery = query.isEmpty || vendor.name.toLowerCase().contains(query) || vendor.cuisines.toLowerCase().contains(query);
      final matchesFilter = _selectedFilter == null || vendor.cuisines.toLowerCase().contains(_selectedFilter!.toLowerCase());
      return matchesQuery && matchesFilter;
    }).toList();
    final cards = filteredVendors.expand((vendor) => [
      _VendorCard(vendor: vendor),
      const SizedBox(height: 12),
    ]).toList();

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('TAKEONTIME', style: TextStyle(fontSize: 10, letterSpacing: 1.6, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('What are you craving?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.location_on_outlined), tooltip: 'Pickup location'),
          IconButton(onPressed: _choosePickupLocation, icon: const Icon(Icons.location_on_outlined), tooltip: 'Pickup: $_pickupLocation'),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SearchBar(onChanged: (value) => setState(() => _searchQuery = value)),
              const SizedBox(height: 16),
              _QuickFilterRow(selectedFilter: _selectedFilter, onChanged: (value) => setState(() => _selectedFilter = value)),
              const SizedBox(height: 16),
              const _SectionHeader(title: 'Popular near you'),
              if (_loading) const LinearProgressIndicator(),
              if (!_loading && filteredVendors.isEmpty) const Card(child: ListTile(title: Text('No vendors match your search'), subtitle: Text('Try another cuisine or clear the filter.'))),
              ...cards,
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Saved favorites'),
              const _FavoriteRow(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Loyalty rewards'),
              const _RewardsCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Today\'s deals'),
              const _TodayDealsCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Delivery status'),
              const _DeliveryCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Saved routines'),
              const _RoutineCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Membership perks'),
              const _MembershipCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Quick reorders'),
              const _ReorderCard(),
              const SizedBox(height: 20),
              const _SectionHeader(title: 'Your cart'),
              const _CartSummaryCard(),
            ],
          ),
        ),
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  const _SearchBar({required this.onChanged});

  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(16),
        boxShadow: const [BoxShadow(color: Color(0x0A1F2937), blurRadius: 14, offset: Offset(0, 5))],
      ),
      child: TextField(
        onChanged: onChanged,
        decoration: const InputDecoration(
          border: InputBorder.none,
          icon: Icon(Icons.search_rounded, color: Color(0xFF16A34A)),
          hintText: 'Search cuisines, dishes, or vendors',
        ),
      ),
    );
  }
}

class _QuickFilterRow extends StatelessWidget {
  const _QuickFilterRow({required this.selectedFilter, required this.onChanged});

  final String? selectedFilter;
  final ValueChanged<String?> onChanged;

  @override
  Widget build(BuildContext context) {
    final chips = ['Healthy', 'Quick', 'Budget', 'Veg'];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: chips
          .map(
            (chip) => FilterChip(
              label: Text(chip),
              selected: selectedFilter == chip,
              onSelected: (selected) => onChanged(selected ? chip : null),
            ),
          )
          .toList(),
    );
  }
}

class _FavoriteRow extends StatelessWidget {
  const _FavoriteRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 120,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: const [
          _FavoriteCard(title: 'Little Fern', subtitle: 'Healthy bowls'),
          SizedBox(width: 12),
          _FavoriteCard(title: 'Bamboo Bowl', subtitle: 'Rice bowls'),
          SizedBox(width: 12),
          _FavoriteCard(title: 'Saffron', subtitle: 'Snacks'),
        ],
      ),
    );
  }
}

class _FavoriteCard extends StatelessWidget {
  const _FavoriteCard({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.favorite_border),
          const Spacer(),
          Text(title, style: Theme.of(context).textTheme.titleSmall),
          Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
      ),
    );
  }
}

class _VendorCard extends StatelessWidget {
  const _VendorCard({required this.vendor});

  final _DiscoveryVendor vendor;

  @override
  Widget build(BuildContext context) {
    final statusColor = vendor.isOpen ? Colors.green : Colors.orange;

    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () {
        if (!vendor.isOpen) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${vendor.name} is ${vendor.status.toLowerCase()} and cannot accept orders right now.')));
          return;
        }
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => VendorDetailScreen(
              vendorId: vendor.id,
              name: vendor.name,
              eta: vendor.eta,
              status: vendor.status,
              cuisines: vendor.cuisines,
            ),
          ),
        );
      },
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(Icons.storefront, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: Text(vendor.name, style: Theme.of(context).textTheme.titleMedium)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: statusColor.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            vendor.status,
                            style: TextStyle(
                              color: statusColor,
                              fontWeight: FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(vendor.cuisines, style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.access_time, size: 16, color: Colors.grey),
                        const SizedBox(width: 6),
                        Text(vendor.eta, style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(vendor.isOpen ? 'Pickup · 4.8 ★' : 'Ordering unavailable', style: const TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RewardsCard extends StatelessWidget {
  const _RewardsCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Available rewards', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('₹180 cashback available for your next healthy bowl order.'),
            SizedBox(height: 8),
            Text('2 stamps left until your next free drink.'),
          ],
        ),
      ),
    );
  }
}

class _TodayDealsCard extends StatelessWidget {
  const _TodayDealsCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Lunch special', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Buy any combo and get a seasonal fruit cup free.'),
            SizedBox(height: 8),
            Text('Valid until 2:00 PM today for pickup orders.'),
          ],
        ),
      ),
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  const _DeliveryCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Next delivery', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Estimated arrival: 12:50 PM from Little Fern Kitchen.'),
            SizedBox(height: 8),
            Text('Driver is 6 minutes away and will call on arrival.'),
          ],
        ),
      ),
    );
  }
}

class _RoutineCard extends StatelessWidget {
  const _RoutineCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Your lunch rhythm', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Mon–Fri: healthy bowl and coffee at 1:00 PM from Little Fern.'),
            SizedBox(height: 8),
            Text('Default pickup location: Home · 16th Main.'),
          ],
        ),
      ),
    );
  }
}

class _MembershipCard extends StatelessWidget {
  const _MembershipCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Member status', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Gold tier: free delivery over ₹299 and 15% off on third-order weekly bundles.'),
          ],
        ),
      ),
    );
  }
}

class _ReorderCard extends StatelessWidget {
  const _ReorderCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Repeat favorites', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Classic Bowl • Coconut Curry • Mango Rice Bowl'),
            SizedBox(height: 8),
            Text('Last reordered 2 days ago from Little Fern Kitchen.'),
          ],
        ),
      ),
    );
  }
}

class _CartSummaryCard extends StatelessWidget {
  const _CartSummaryCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('2 items • ₹460', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            const Text('Classic Bowl • ₹220'),
            const Text('Coconut Curry • ₹240'),
            const SizedBox(height: 12),
            const Row(
              children: [
                Icon(Icons.payments_outlined, size: 18),
                SizedBox(width: 8),
                Text('UPI • Razorpay'),
              ],
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const CheckoutScreen(),
                    ),
                  );
                },
                child: const Text('Checkout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
