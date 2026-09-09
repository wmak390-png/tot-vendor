import 'package:flutter/material.dart';

class DirectoryScreen extends StatelessWidget {
  const DirectoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vendor directory')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _DirectorySummaryRow(),
          SizedBox(height: 16),
          _VendorDirectoryRow(name: 'Little Fern Kitchen', city: 'Bengaluru', status: 'Approved'),
          SizedBox(height: 12),
          _VendorDirectoryRow(name: 'Bamboo Bowl', city: 'Hyderabad', status: 'Pending'),
          SizedBox(height: 12),
          _VendorDirectoryRow(name: 'Saffron Bites', city: 'Chennai', status: 'Approved'),
        ],
      ),
    );
  }
}

class _DirectorySummaryRow extends StatelessWidget {
  const _DirectorySummaryRow();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: const [
        Expanded(child: _MetricCard(label: 'Approved', value: '126')),
        SizedBox(width: 12),
        Expanded(child: _MetricCard(label: 'Pending', value: '20')),
      ],
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label),
            const SizedBox(height: 6),
            Text(value, style: Theme.of(context).textTheme.headlineSmall),
          ],
        ),
      ),
    );
  }
}

class _VendorDirectoryRow extends StatelessWidget {
  const _VendorDirectoryRow({required this.name, required this.city, required this.status});

  final String name;
  final String city;
  final String status;

  @override
  Widget build(BuildContext context) {
    final color = status == 'Approved' ? Colors.green : Colors.orange;
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.store)),
        title: Text(name),
        subtitle: Text(city),
        trailing: Text(status, style: TextStyle(color: color)),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => VendorDirectoryDetailScreen(name: name, city: city, status: status),
          ),
        ),
      ),
    );
  }
}

class VendorDirectoryDetailScreen extends StatelessWidget {
  const VendorDirectoryDetailScreen({super.key, required this.name, required this.city, required this.status});

  final String name;
  final String city;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: ListTile(
              title: Text(name),
              subtitle: Text(city),
              trailing: Text(status),
            ),
          ),
          const SizedBox(height: 12),
          const _DetailRow(label: 'Payout frequency', value: 'Weekly'),
          const _DetailRow(label: 'Avg. daily orders', value: '148'),
          const _DetailRow(label: 'Rating', value: '4.8/5'),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(child: ListTile(title: Text(label), trailing: Text(value)));
  }
}
