import 'package:flutter/material.dart';

class ApprovalsScreen extends StatelessWidget {
  const ApprovalsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TakeOnTime Admin')),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: const [
            DrawerHeader(child: Text('Admin Console')),
            ListTile(leading: Icon(Icons.approval), title: Text('Vendor approvals')),
            ListTile(leading: Icon(Icons.storefront), title: Text('Vendor directory')),
            ListTile(leading: Icon(Icons.analytics_outlined), title: Text('Orders monitor')),
            ListTile(leading: Icon(Icons.settings), title: Text('Platform settings')),
          ],
        ),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            _SummaryCard(title: 'Pending approvals', value: '18'),
            SizedBox(height: 12),
            _SummaryCard(title: 'Active vendors', value: '146'),
            SizedBox(height: 12),
            _SummaryCard(title: 'Orders today', value: '1,204'),
            SizedBox(height: 24),
            Text('Operations overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            SizedBox(height: 12),
            _ApprovalRow(name: 'Little Fern Kitchen', status: 'Awaiting review'),
            _ApprovalRow(name: 'Bamboo Bowl', status: 'Needs docs'),
            _ApprovalRow(name: 'Saffron Bites', status: 'Approved'),
            SizedBox(height: 16),
            _ReportCard(title: 'Daily reports', value: '12 issues resolved'),
            SizedBox(height: 16),
            _SummaryInfoCard(title: 'Risk summary', message: '3 vendors flagged for ingredient compliance review.'),
            SizedBox(height: 16),
            _SummaryInfoCard(title: 'Payout watch', message: '3 vendors are awaiting settlement review for this cycle.'),
            SizedBox(height: 16),
            _SummaryInfoCard(title: 'System health', message: 'API latency is stable; 99.3% uptime across all regions.'),
            SizedBox(height: 16),
            _SummaryInfoCard(title: 'Escalations', message: '2 operational escalations require review for weekend service coverage.'),
            SizedBox(height: 16),
            _SummaryInfoCard(title: 'Vendor scorecard', message: 'Average vendor satisfaction: 4.7/5; quality compliance: 96%.'),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        trailing: Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  const _ReportCard({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.analytics_outlined),
        title: Text(title),
        trailing: Text(value),
      ),
    );
  }
}

class _SummaryInfoCard extends StatelessWidget {
  const _SummaryInfoCard({required this.title, required this.message});

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

class _ApprovalRow extends StatelessWidget {
  const _ApprovalRow({required this.name, required this.status});

  final String name;
  final String status;

  @override
  Widget build(BuildContext context) {
    final isPending = status != 'Approved';
    final badgeColor = isPending ? Colors.orange : Colors.green;

    return InkWell(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => ReviewScreen(name: name, status: status),
          ),
        );
      },
      child: Card(
        child: ListTile(
          leading: const CircleAvatar(child: Icon(Icons.storefront_outlined)),
          title: Text(name),
          subtitle: Text(status),
          trailing: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: badgeColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              isPending ? 'Review' : 'Live',
              style: TextStyle(color: badgeColor, fontWeight: FontWeight.w700, fontSize: 11),
            ),
          ),
        ),
      ),
    );
  }
}

class ReviewScreen extends StatelessWidget {
  const ReviewScreen({super.key, required this.name, required this.status});

  final String name;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(name)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Text('Status: $status'),
                  const SizedBox(height: 16),
                  const Text('Documents checked: GST, FSSAI, bank proof'),
                  const SizedBox(height: 16),
                  const Text('Vendor profile is complete but the menu list needs final approval.'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(child: FilledButton.tonal(onPressed: () {}, child: const Text('Request docs'))),
              const SizedBox(width: 12),
              Expanded(child: FilledButton(onPressed: () {}, child: const Text('Approve'))),
            ],
          ),
        ],
      ),
    );
  }
}
