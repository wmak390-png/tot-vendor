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
              backgroundColor: Color(0xFFE7F9EE),
              child: Icon(Icons.person, size: 42, color: Colors.green),
            ),
            SizedBox(height: 16),
            Center(child: Text('Aarav Sharma', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700))),
            SizedBox(height: 20),
            _ProfileRow(label: 'Member', value: 'Gold tier'),
            _ProfileRow(label: 'Phone', value: '+91 98765 43210'),
            _ProfileRow(label: 'Address', value: '16th Main, Bengaluru'),
            _ProfileRow(label: 'Saved card', value: 'Visa •••• 1180'),
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
