import 'package:flutter/material.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final orders = [
      const _OrderCard(
        orderId: '#TOT-4826',
        customer: 'Nisha P.',
        total: '₹620',
        status: 'Confirmed',
      ),
      const SizedBox(height: 12),
      const _OrderCard(
        orderId: '#TOT-4823',
        customer: 'Karan V.',
        total: '₹540',
        status: 'Preparing',
      ),
      const SizedBox(height: 12),
      const _OrderCard(
        orderId: '#TOT-4814',
        customer: 'Aarav Sharma',
        total: '₹482',
        status: 'Ready',
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Orders')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const _FilterChipsRow(),
            const SizedBox(height: 16),
            const _LiveQueueCard(),
            const SizedBox(height: 16),
            const _PickupBoardCard(),
            const SizedBox(height: 16),
            ...orders,
          ],
        ),
      ),
    );
  }
}

class _FilterChipsRow extends StatelessWidget {
  const _FilterChipsRow();

  @override
  Widget build(BuildContext context) {
    final chips = ['All', 'Ready', 'Preparing', 'Pickup'];
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: chips
          .map(
            (chip) => ChoiceChip(
              label: Text(chip),
              selected: chip == 'All',
              onSelected: (_) {},
            ),
          )
          .toList(),
    );
  }
}

class _LiveQueueCard extends StatelessWidget {
  const _LiveQueueCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Live queue', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('6 orders in the active queue • 3 ready for pickup'),
          ],
        ),
      ),
    );
  }
}

class _PickupBoardCard extends StatelessWidget {
  const _PickupBoardCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Pickup board', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Lane A: 2 ready • Lane B: 1 ready • Queue average: 4 mins'),
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
