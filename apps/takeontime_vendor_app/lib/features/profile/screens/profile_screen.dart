import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: const [
            CircleAvatar(
              radius: 42,
              child: Icon(Icons.person, size: 48),
            ),
            SizedBox(height: 16),
            Center(child: Text('Little Fern Kitchen', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700))),
            SizedBox(height: 20),
            _ProfileRow(label: 'Owner', value: 'Aditi Rao'),
            _ProfileRow(label: 'Phone', value: '+91 98451 22334'),
            _ProfileRow(label: 'Bank', value: 'HDFC •••• 4281'),
          ],
        ),
      ),
    );
  }
}

class _ProfileRow extends StatelessWidget {
  const _ProfileRow({required this.label, required this.value});

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
