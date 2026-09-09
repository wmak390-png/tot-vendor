import 'package:flutter/material.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Platform settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _SettingsRow(label: 'Commission rate', value: '12%'),
          _SettingsRow(label: 'Pickup window', value: '45 min'),
          _SettingsRow(label: 'FCM notifications', value: 'Enabled'),
          _SettingsRow(label: 'Razorpay live mode', value: 'Enabled'),
          SizedBox(height: 8),
          _ToggleSettingRow(label: 'Auto-approve low-risk vendors', value: true),
          _ToggleSettingRow(label: 'Daily check-in reminder', value: false),
          _PolicyCard(),
        ],
      ),
    );
  }
}

class _SettingsRow extends StatelessWidget {
  const _SettingsRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(child: ListTile(title: Text(label), trailing: Text(value)));
  }
}

class _ToggleSettingRow extends StatelessWidget {
  const _ToggleSettingRow({required this.label, required this.value});

  final String label;
  final bool value;

  @override
  Widget build(BuildContext context) {
    return Card(child: SwitchListTile(value: value, onChanged: (_) {}, title: Text(label)));
  }
}

class _PolicyCard extends StatelessWidget {
  const _PolicyCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Text('Platform policy', style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 8),
            Text('Vendor verification window: 72 hours for new stores.'),
          ],
        ),
      ),
    );
  }
}
