import 'package:flutter/material.dart';

import '../data/admin_repository.dart';

class ApprovalsScreen extends StatefulWidget {
  const ApprovalsScreen({super.key});

  @override
  State<ApprovalsScreen> createState() => _ApprovalsScreenState();
}

class _ApprovalsScreenState extends State<ApprovalsScreen> {
  final _repository = const AdminRepository();
  List<AdminVendor> _vendors = const [
    AdminVendor(id: 'demo-1', businessName: 'Little Fern Kitchen', businessType: 'Veg & healthy bowls', address: 'Bengaluru'),
    AdminVendor(id: 'demo-2', businessName: 'Bamboo Bowl', businessType: 'Rice bowls & curries', address: 'Hyderabad'),
    AdminVendor(id: 'demo-3', businessName: 'Saffron Bites', businessType: 'North Indian snacks', address: 'Chennai'),
  ];
  AdminVendor? _selected;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _selected = _vendors.first;
    _loadVendors();
  }

  Future<void> _loadVendors() async {
    try {
      final vendors = await _repository.fetchPendingVendors();
      if (mounted && vendors.isNotEmpty) {
        setState(() {
          _vendors = vendors;
          _selected = vendors.first;
        });
      }
    } catch (_) {
      // Keep demo approvals available when Supabase is not configured locally.
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _approve() async {
    final vendor = _selected;
    if (vendor == null) return;
    setState(() => _saving = true);
    try {
      await _repository.approveVendor(vendor.id);
      if (!mounted) return;
      setState(() {
        _vendors = _vendors.where((candidate) => candidate.id != vendor.id).toList();
        _selected = _vendors.isEmpty ? null : _vendors.first;
        _saving = false;
      });
      _showMessage('${vendor.businessName} approved and published.');
    } catch (_) {
      if (mounted) {
        setState(() => _saving = false);
        _showMessage('Could not approve this vendor.');
      }
    }
  }

  Future<void> _reject() async {
    final vendor = _selected;
    if (vendor == null) return;
    final reasonController = TextEditingController(text: 'Please provide updated compliance documents.');
    final reason = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Request changes'),
        content: TextField(controller: reasonController, maxLines: 3, decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder())),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, reasonController.text.trim()), child: const Text('Send request')),
        ],
      ),
    );
    reasonController.dispose();
    if (reason == null || reason.isEmpty) return;
    setState(() => _saving = true);
    try {
      await _repository.rejectVendor(vendorId: vendor.id, reason: reason);
      if (!mounted) return;
      setState(() {
        _vendors = _vendors.where((candidate) => candidate.id != vendor.id).toList();
        _selected = _vendors.isEmpty ? null : _vendors.first;
        _saving = false;
      });
      _showMessage('Revision request sent to ${vendor.businessName}.');
    } catch (_) {
      if (mounted) {
        setState(() => _saving = false);
        _showMessage('Could not send the revision request.');
      }
    }
  }

  void _showMessage(String message) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('TakeOnTime Admin')),
      drawer: const Drawer(child: SafeArea(child: Column(children: [DrawerHeader(child: Text('Admin Console')), ListTile(leading: Icon(Icons.approval), title: Text('Vendor approvals')), ListTile(leading: Icon(Icons.storefront), title: Text('Vendor directory')), ListTile(leading: Icon(Icons.analytics_outlined), title: Text('Orders monitor')), ListTile(leading: Icon(Icons.settings), title: Text('Platform settings'))]))),
      body: SafeArea(
        child: ListView(padding: const EdgeInsets.all(16), children: [
          Row(children: [Expanded(child: _SummaryCard(title: 'Pending approvals', value: '${_vendors.length}')), const SizedBox(width: 12), Expanded(child: _SummaryCard(title: 'Active vendors', value: '146'))]),
          const SizedBox(height: 12),
          const _SummaryCard(title: 'Orders today', value: '1,204'),
          const SizedBox(height: 24),
          const Text('Operations overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          if (_loading) const LinearProgressIndicator(),
          if (!_loading && _vendors.isEmpty) const Card(child: ListTile(leading: Icon(Icons.check_circle_outline), title: Text('No pending approvals'), subtitle: Text('New vendor applications will appear here.'))),
          ..._vendors.map((vendor) => Card(
                child: ListTile(
                  selected: _selected?.id == vendor.id,
                  leading: const CircleAvatar(child: Icon(Icons.storefront_outlined)),
                  title: Text(vendor.businessName),
                  subtitle: Text('${vendor.address} · ${vendor.businessType}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => setState(() => _selected = vendor),
                ),
              )),
          const SizedBox(height: 16),
          if (_selected != null) _ReviewCard(vendor: _selected!, saving: _saving, onApprove: _approve, onReject: _reject),
          const SizedBox(height: 16),
          const _SummaryInfoCard(title: 'Risk summary', message: 'Vendor compliance checks are reviewed before publication.'),
        ]),
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.vendor, required this.saving, required this.onApprove, required this.onReject});

  final AdminVendor vendor;
  final bool saving;
  final VoidCallback onApprove;
  final VoidCallback onReject;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(vendor.businessName, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text('${vendor.businessType}\n${vendor.address}'),
          const SizedBox(height: 12),
          const Text('Documents checked: GST, FSSAI, bank proof'),
          const SizedBox(height: 16),
          Row(children: [Expanded(child: OutlinedButton(onPressed: saving ? null : onReject, child: const Text('Request docs'))), const SizedBox(width: 12), Expanded(child: FilledButton(onPressed: saving ? null : onApprove, child: saving ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Approve')))]),
        ]),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  const _SummaryCard({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) => Card(child: ListTile(title: Text(title), trailing: Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700))));
}

class _SummaryInfoCard extends StatelessWidget {
  const _SummaryInfoCard({required this.title, required this.message});

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(title, style: const TextStyle(fontWeight: FontWeight.w700)), const SizedBox(height: 8), Text(message)])));
}
