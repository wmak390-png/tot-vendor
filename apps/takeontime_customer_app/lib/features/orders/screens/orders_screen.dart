import 'package:flutter/material.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final orders = [
      OrderEntry('Little Fern Kitchen', 'Order #1041', 'In progress', 'Ready by 12:40 PM'),
      OrderEntry('Bamboo Bowl', 'Order #1038', 'Delivered', 'Tuesday, 1:15 PM'),
      OrderEntry('Saffron Bites', 'Order #1032', 'Reviewing', 'Pickup confirmed'),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: SafeArea(
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: orders.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final order = orders[index];
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
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const _OrderRow(label: 'Classic Bowl', value: '₹220'),
              const _OrderRow(label: 'Coconut Curry', value: '₹240'),
              const _OrderRow(label: 'Delivery', value: '₹30'),
              const _OrderRow(label: 'Total', value: '₹490'),
            ],
          ),
        ),
      ),
    );
  }
}

class OrderEntry {
  const OrderEntry(this.vendor, this.code, this.status, this.time);

  final String vendor;
  final String code;
  final String status;
  final String time;
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
