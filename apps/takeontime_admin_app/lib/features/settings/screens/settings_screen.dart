import 'package:flutter/material.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _autoApprove = true;
  bool _dailyReminder = false;
  bool _liveSupport = true;
  bool _riskAlerts = true;

  void _reset() => setState(() {
        _autoApprove = true;
        _dailyReminder = false;
        _liveSupport = true;
        _riskAlerts = true;
      });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Platform settings'),
        actions: [
          IconButton(
            onPressed: _reset,
            tooltip: 'Reset settings',
            icon: const Icon(Icons.restart_alt),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _SettingsRow(label: 'Commission rate', value: '12%'),
          const _SettingsRow(label: 'Pickup window', value: '45 min'),
          const _SettingsRow(label: 'FCM notifications', value: 'Enabled'),
          const _SettingsRow(label: 'Razorpay live mode', value: 'Enabled'),
          const _SettingsRow(label: 'Support SLA', value: '2 hours'),
          const SizedBox(height: 8),
          _ToggleSettingRow(
            label: 'Auto-approve low-risk vendors',
            value: _autoApprove,
            onChanged: (value) => setState(() => _autoApprove = value),
          ),
          _ToggleSettingRow(
            label: 'Daily check-in reminder',
            value: _dailyReminder,
            onChanged: (value) => setState(() => _dailyReminder = value),
          ),
          _ToggleSettingRow(
            label: 'Live support escalation',
            value: _liveSupport,
            onChanged: (value) => setState(() => _liveSupport = value),
          ),
          _ToggleSettingRow(
            label: 'High-risk vendor alerts',
            value: _riskAlerts,
            onChanged: (value) => setState(() => _riskAlerts = value),
          ),
          const _PolicyCard(),
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
  Widget build(BuildContext context) => Card(
        child: ListTile(
          title: Text(label),
          trailing: Text(value),
        ),
      );
}

class _ToggleSettingRow extends StatelessWidget {
  const _ToggleSettingRow({
    required this.label,
    required this.value,
    required this.onChanged,
  });

  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) => Card(
        child: SwitchListTile(
          value: value,
          onChanged: onChanged,
          title: Text(label),
        ),
      );
}

class _PolicyCard extends StatelessWidget {
  const _PolicyCard();

  @override
  Widget build(BuildContext context) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text('Platform policy', style: TextStyle(fontWeight: FontWeight.w700)),
              SizedBox(height: 8),
              Text('Vendor verification window: 72 hours for new stores. Operators are alerted when compliance checks remain incomplete beyond the SLA.'),
            ],
          ),
        ),
      );
}
