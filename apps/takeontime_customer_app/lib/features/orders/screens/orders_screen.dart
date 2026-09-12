import 'dart:async';

import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';
import '../data/customer_orders_repository.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _repository = const CustomerOrdersRepository();
  StreamSubscription<List<Map<String, dynamic>>>? _ordersSubscription;
  var _loading = true;
  List<OrderEntry> _orders = const [
    OrderEntry('Little Fern Kitchen', 'Order #1041', 'In progress', 'Ready by 12:40 PM'),
    OrderEntry('Bamboo Bowl', 'Order #1038', 'Delivered', 'Tuesday, 1:15 PM'),
    OrderEntry('Saffron Bites', 'Order #1032', 'Reviewing', 'Pickup confirmed'),
  ];

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  @override
  void dispose() {
    _ordersSubscription?.cancel();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    final customerId = SupabaseBootstrap.client?.auth.currentUser?.id;
    if (customerId == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final orders = await _repository.fetchOrders(customerId);
      if (!mounted) return;
      setState(() {
        _orders = orders.map((order) => OrderEntry(
          order.vendorName,
          'Order #${order.id.substring(0, order.id.length > 8 ? 8 : order.id.length)}',
          order.status,
          order.createdAt?.toLocal().toString() ?? 'Recently placed',
          totalPaise: order.totalPaise,
          notes: order.notes,
          items: order.items,
        )).toList();
        _loading = false;
      });
      _ordersSubscription = _repository.watchOrders(customerId).listen((rows) {
        if (!mounted) return;
        final liveOrders = rows
            .map(CustomerOrder.fromJson)
            .map((order) => OrderEntry(
              order.vendorName,
                  'Order #${order.id.substring(0, order.id.length > 8 ? 8 : order.id.length)}',
                  order.status,
                  order.createdAt?.toLocal().toString() ?? 'Recently placed',
              totalPaise: order.totalPaise,
              notes: order.notes,
              items: order.items,
                ))
            .toList();
        setState(() => _orders = liveOrders);
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _orders.length + (_loading ? 1 : 0),
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            if (_loading && index == 0) return const LinearProgressIndicator();
            final order = _orders[index - (_loading ? 1 : 0)];
            return Card(
              child: ListTile(
                title: Text(order.vendor),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(order.code),
                    Text(order.status),
                  ],
                ),
                trailing: Text(order.time),
                onTap: () {
                  Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => OrderDetailScreen(order: order),
                    ),
                  );
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.order});

  final OrderEntry order;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(order.code)),
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
                      Text(order.vendor, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 8),
                      Text('Status: ${order.status}'),
                      const SizedBox(height: 4),
                      Text('ETA: ${order.time}'),
                      const SizedBox(height: 12),
                      const Text('Order timeline'),
                      const SizedBox(height: 8),
                      const _TimelineRow(label: 'Placed', time: '11:20 AM'),
                      const _TimelineRow(label: 'Kitchen confirmed', time: '11:28 AM'),
                      const _TimelineRow(label: 'Pickup ready', time: '11:42 AM'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              ...order.items.map((item) => _OrderRow(
                    label: '${item.quantity} × ${item.name}',
                    value: '₹${(item.unitPricePaise * item.quantity / 100).toStringAsFixed(0)}',
                  )),
              _OrderRow(label: 'Total', value: '₹${(order.totalPaise / 100).toStringAsFixed(0)}'),
              if (order.notes != null && order.notes!.isNotEmpty) _OrderRow(label: 'Note', value: order.notes!),
              const SizedBox(height: 16),
              const _SummaryCard(
                title: 'Recent spend',
                message: 'This month, you have spent ₹2,180 across 8 orders and unlocked a free-drink reward.',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class OrderEntry {
  const OrderEntry(
    this.vendor,
    this.code,
    this.status,
    this.time, {
    this.totalPaise = 0,
    this.notes,
    this.items = const [],
  });

  final String vendor;
  final String code;
  final String status;
  final String time;
  final int totalPaise;
  final String? notes;
  final List<CustomerOrderItem> items;
}

class _OrderRow extends StatelessWidget {
  const _OrderRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        trailing: Text(value),
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(time, style: const TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.title, required this.message});

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Text(message),
          ],
        ),
      ),
    );
  }
}
