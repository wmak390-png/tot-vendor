import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

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
  double _platformFee = 2;
  double _commission = 6;
  double _gst = 5;
  bool _loadingConfig = true;
  bool _savingConfig = false;

  @override
  void initState() {
    super.initState();
    _loadConfig();
  }

  Future<void> _loadConfig() async {
    final client = SupabaseBootstrap.client;
    if (client == null) {
      setState(() => _loadingConfig = false);
      return;
    }
    try {
      final rows = await client.from('system_config').select('key, value');
      final values = {for (final row in rows) row['key'] as String: (row['value'] as num).toDouble()};
      if (mounted) {
        setState(() {
          _platformFee = values['platform_fee_pct'] ?? _platformFee;
          _commission = values['vendor_commission_pct'] ?? _commission;
          _gst = values['gst_default_rate'] ?? _gst;
        });
      }
    } finally {
      if (mounted) setState(() => _loadingConfig = false);
    }
  }

  Future<void> _saveConfig() async {
    final client = SupabaseBootstrap.client;
    if (client == null) return;
    setState(() => _savingConfig = true);
    try {
      for (final entry in {'platform_fee_pct': _platformFee, 'vendor_commission_pct': _commission, 'gst_default_rate': _gst}.entries) {
        await client.from('system_config').upsert({'key': entry.key, 'value': entry.value, 'updated_by': client.auth.currentUser?.id, 'updated_at': DateTime.now().toUtc().toIso8601String()});
      }
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Rates saved for future transactions.')));
    } finally {
      if (mounted) setState(() => _savingConfig = false);
    }
  }

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
          if (_loadingConfig) const LinearProgressIndicator(),
          _RateRow(label: 'Platform fee', value: _platformFee, onChanged: (value) => setState(() => _platformFee = value)),
          _RateRow(label: 'Vendor commission', value: _commission, onChanged: (value) => setState(() => _commission = value)),
          _RateRow(label: 'Default GST', value: _gst, onChanged: (value) => setState(() => _gst = value)),
          FilledButton.icon(onPressed: _savingConfig ? null : _saveConfig, icon: const Icon(Icons.save_outlined), label: Text(_savingConfig ? 'Saving...' : 'Save rates')),
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

class _RateRow extends StatelessWidget {
  const _RateRow({required this.label, required this.value, required this.onChanged});

  final String label;
  final double value;
  final ValueChanged<double> onChanged;

  @override
  Widget build(BuildContext context) {
    final controller = TextEditingController(text: value.toStringAsFixed(1));
    return Card(child: Padding(padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6), child: TextField(controller: controller, keyboardType: const TextInputType.numberWithOptions(decimal: true), decoration: InputDecoration(labelText: '$label (%)', suffixIcon: IconButton(icon: const Icon(Icons.check_rounded), onPressed: () => onChanged(double.tryParse(controller.text) ?? value))))));
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
