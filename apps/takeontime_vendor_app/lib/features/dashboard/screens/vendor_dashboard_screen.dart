import 'package:flutter/material.dart';

import '../../../core/services/vendor_app_service.dart';
import '../../menu/screens/menu_screen.dart';
import '../../orders/screens/orders_screen.dart';
import '../../profile/screens/profile_screen.dart';
import '../../store/data/vendor_operations_repository.dart';

const _dashboardVendorId = 'demo-vendor-1';

class VendorDashboardScreen extends StatefulWidget {
  const VendorDashboardScreen({super.key});

  @override
  State<VendorDashboardScreen> createState() => _VendorDashboardScreenState();
}

class _VendorDashboardScreenState extends State<VendorDashboardScreen> {
  final _repository = const VendorOperationsRepository();
  final _service = const VendorAppService();
  String _vendorId = _dashboardVendorId;
  bool _acceptingOrders = true;
  DateTime? _breakUntil;
  int _orderCount = 24;
  double _revenue = 3800;
  bool _loading = true;

  bool get _onBreak => _breakUntil != null && _breakUntil!.isAfter(DateTime.now());

  @override
  void initState() {
    super.initState();
    _loadSnapshot();
  }

  Future<void> _loadSnapshot() async {
    try {
      final resolvedVendorId = await _repository.resolveVendorId(fallback: _dashboardVendorId);
      if (resolvedVendorId == null || resolvedVendorId.isEmpty) {
        if (mounted) setState(() => _loading = false);
        return;
      }
      _vendorId = resolvedVendorId;
      final snapshot = await _repository.fetchSnapshot(_vendorId);
      final vendor = snapshot?['vendor'] as Map<String, dynamic>?;
      final orders = (snapshot?['orders'] as List<dynamic>?) ?? const [];
      if (mounted) {
        setState(() {
          _acceptingOrders = vendor?['accepting_orders'] as bool? ?? _acceptingOrders;
          _breakUntil = DateTime.tryParse(vendor?['break_until'] as String? ?? '')?.toLocal();
          _orderCount = orders.length;
          _revenue = orders.fold<double>(0, (total, order) => total + (((order as Map<String, dynamic>)['amount_paise'] as num?)?.toDouble() ?? 0) / 100);
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = _service.dashboard;
    final recentOrders = dashboard.recentOrders.map((order) => [
      _OrderCard(
        orderId: order.orderId,
        customer: order.customer,
        total: order.total,
        status: order.status,
      ),
      const SizedBox(height: 12),
    ]).expand((widgets) => widgets).toList();

    final status = _onBreak ? 'On break' : _acceptingOrders ? dashboard.statusLabel : 'Closed · Orders paused';
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('VENDOR CONTROL ROOM', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)),
            SizedBox(height: 2),
            Text('Tiffin & Co.', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
          ],
        ),
        actions: [
          IconButton(onPressed: _loadSnapshot, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh store data'),
          const SizedBox(width: 8),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HeroCard(
                title: 'Store status',
                value: status,
                subtitle: _loading ? 'Loading live store status…' : 'Live operational status',
              ),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Today'),
              _MetricRow(orderCount: _orderCount, revenue: _revenue),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Quick actions'),
              const _QuickActionGrid(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Performance'),
              const _PerformanceCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Operations insight'),
              _InsightCard(summary: dashboard.performanceSummary),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Staffing & timing'),
              const _StaffingCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Inventory health'),
              const _InventoryCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Cashflow'),
              const _CashflowCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Kitchen checklist'),
              const _KitchenChecklistCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Recent orders'),
              ...recentOrders,
              const SizedBox(height: 20),
              _SectionHeader(title: 'Top sellers'),
              const _TopSellerCard(),
              const SizedBox(height: 20),
              _SectionHeader(title: 'Delivery optimization'),
              const _DeliveryOptimizationCard(),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => const MenuScreen())),
        icon: const Icon(Icons.add_business),
        label: const Text('New item'),
      ),
    );
  }
}

class _HeroCard extends StatelessWidget {
  const _HeroCard({required this.title, required this.value, required this.subtitle});

  final String title;
  final String value;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Card(
      color: scheme.secondary,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Row(
          children: [
            Container(
              height: 48,
              width: 48,
              decoration: BoxDecoration(color: scheme.primary, borderRadius: BorderRadius.circular(15)),
              child: const Icon(Icons.storefront_rounded, color: Colors.white),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title.toUpperCase(), style: const TextStyle(color: Color(0xFFB9C9BF), fontSize: 10, letterSpacing: 1.2, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 6),
                  Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(color: Color(0xFFB9C9BF), fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
              child: Text(_statusLabel(value), style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w800)),
            ),
          ],
        ),
      ),
    );
  }

  static String _statusLabel(String value) => value.toLowerCase().contains('closed') ? 'PAUSED' : value.toLowerCase().contains('break') ? 'BREAK' : 'OPEN';
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

class _MetricRow extends StatelessWidget {
  const _MetricRow({required this.orderCount, required this.revenue});

  final int orderCount;
  final double revenue;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatTile(label: 'Orders', value: '$orderCount')),
        SizedBox(width: 12),
        Expanded(child: _StatTile(label: 'Revenue', value: '₹${revenue.toStringAsFixed(0)}')),
        SizedBox(width: 12),
        Expanded(child: _StatTile(label: 'Avg. prep', value: '18m')),
      ],
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Text(value, style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 4),
            Text(label, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _QuickActionGrid extends StatelessWidget {
  const _QuickActionGrid();

  @override
  Widget build(BuildContext context) {
    final actions = [
      ('Today\'s Orders', Icons.receipt_long_outlined),
      ('Manage Menu', Icons.restaurant_menu_outlined),
      ('Add Item', Icons.add_circle_outline),
      ('Profile', Icons.person_outline),
    ];

    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.4,
      children: actions.map((entry) {
        final label = entry.$1;
        final icon = entry.$2;
        return Card(
          child: InkWell(
            onTap: () {
              final screen = switch (label) {
                'Today\'s Orders' => const OrdersScreen(),
                'Manage Menu' || 'Add Item' => const MenuScreen(),
                'Profile' => const ProfileScreen(),
                _ => null,
              };
              if (screen != null) {
                Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => screen));
              }
            },
            borderRadius: BorderRadius.circular(12),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(color: Theme.of(context).colorScheme.primaryContainer, borderRadius: BorderRadius.circular(12)),
                    child: Icon(icon, size: 22, color: Theme.of(context).colorScheme.primary),
                  ),
                  const SizedBox(height: 12),
                  Text(label, style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w800)),
                ],
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          const SizedBox(height: 6),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _PerformanceCard extends StatelessWidget {
  const _PerformanceCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('This week', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 12),
            const Row(
              children: [
                Expanded(child: _MetricChip(label: 'Sales', value: '₹12.4k')),
                SizedBox(width: 8),
                Expanded(child: _MetricChip(label: 'Repeat', value: '31%')),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InsightCard extends StatelessWidget {
  const _InsightCard({required this.summary});

  final String summary;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Peak demand', style: TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(summary),
          ],
        ),
      ),
    );
  }
}

class _StaffingCard extends StatelessWidget {
  const _StaffingCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Coverage plan', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('2 kitchen staff on station · 1 expeditor at pickup counter.'),
            SizedBox(height: 8),
            Text('Pickup lane status: stable, 4-minute wait target.'),
          ],
        ),
      ),
    );
  }
}

class _InventoryCard extends StatelessWidget {
  const _InventoryCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Inventory watch', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Rice, tofu, and greens are at 92% of target stock.'),
            SizedBox(height: 8),
            Text('Reorder recommended for lemon dressing and packet wraps.'),
          ],
        ),
      ),
    );
  }
}

class _CashflowCard extends StatelessWidget {
  const _CashflowCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Cashflow', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Settlement due in 2 days: ₹12,480 from recent orders.'),
            SizedBox(height: 8),
            Text('Faster payout route is enabled for preferred vendors.'),
          ],
        ),
      ),
    );
  }
}

class _KitchenChecklistCard extends StatelessWidget {
  const _KitchenChecklistCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Prep checklist', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Bean soak complete • Grill calibrated • Compote batch ready'),
          ],
        ),
      ),
    );
  }
}

class _TopSellerCard extends StatelessWidget {
  const _TopSellerCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Top seller', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Signature Bowl · 38 orders today · ₹7,220 revenue.'),
          ],
        ),
      ),
    );
  }
}

class _DeliveryOptimizationCard extends StatelessWidget {
  const _DeliveryOptimizationCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Delivery plan', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Add a second rider from 12:30 PM to 2:00 PM to reduce queue overflow.'),
          ],
        ),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({
    required this.orderId,
    required this.customer,
    required this.total,
    required this.status,
  });

  final String orderId;
  final String customer;
  final String total;
  final String status;

  @override
  Widget build(BuildContext context) {
    final statusColor = switch (status) {
      'Ready' => Colors.green,
      'Confirmed' || 'Preparing' => Colors.orange,
      _ => Colors.grey,
    };

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => OrderDetailScreen(
              orderId: orderId,
              customer: customer,
              total: total,
              status: status,
            ),
          ),
        );
      },
      child: Card(
        child: ListTile(
          title: Text(orderId),
          subtitle: Text(customer),
          trailing: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(total, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({
    super.key,
    required this.orderId,
    required this.customer,
    required this.total,
    required this.status,
  });

  final String orderId;
  final String customer;
  final String total;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(orderId)),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ListView(
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(customer, style: Theme.of(context).textTheme.titleLarge),
                      const SizedBox(height: 8),
                      Text('Status: $status'),
                      const SizedBox(height: 12),
                      Text('Total: $total'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Timeline', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              const _TimelineRow(label: 'Order placed', time: '09:35 AM'),
              const _TimelineRow(label: 'Kitchen confirmed', time: '09:50 AM'),
              const _TimelineRow(label: 'Pickup ready', time: '10:10 AM'),
            ],
          ),
        ),
      ),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({required this.label, required this.time});

  final String label;
  final String time;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.check_circle_outline),
        title: Text(label),
        trailing: Text(time),
      ),
    );
  }
}
