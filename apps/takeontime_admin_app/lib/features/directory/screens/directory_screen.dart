import 'package:flutter/material.dart';

import '../../../core/services/admin_app_service.dart';
import '../../../core/supabase/supabase_bootstrap.dart';
import '../../approvals/data/admin_repository.dart';

class DirectoryScreen extends StatefulWidget {
  const DirectoryScreen({super.key});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  final _repository = const AdminRepository();
  final _service = const AdminAppService();
  List<AdminVendor> _vendors = const [];
  final _searchController = TextEditingController();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _vendors = SupabaseBootstrap.client == null ? _service.pendingVendors
        .map((vendor) => AdminVendor(
              id: vendor.id,
              businessName: vendor.businessName,
              businessType: vendor.businessType,
              address: vendor.address,
              approvalNote: vendor.note,
              isApproved: vendor.isApproved,
            ))
        .toList() : const [];
    _loadVendors();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadVendors() async {
    try {
      final vendors = await _repository.fetchVendors();
      if (mounted && vendors.isNotEmpty) setState(() => _vendors = vendors);
    } catch (_) {
      if (mounted && SupabaseBootstrap.client != null) setState(() => _vendors = const []);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vendor directory')),
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _searchController,
          builder: (context, _) {
            final query = _searchController.text.trim().toLowerCase();
            final vendors = _vendors.where((vendor) => vendor.businessName.toLowerCase().contains(query) || vendor.address.toLowerCase().contains(query) || vendor.businessType.toLowerCase().contains(query)).toList();
            final approved = _vendors.where((vendor) => vendor.isApproved).length;
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Row(children: [Expanded(child: _MetricCard(label: 'Total vendors', value: '${_vendors.length}')), const SizedBox(width: 12), Expanded(child: _MetricCard(label: 'Pending review', value: '${_vendors.where((vendor) => !vendor.isApproved).length}'))]),
                const SizedBox(height: 16),
                TextField(controller: _searchController, decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search vendors', border: OutlineInputBorder())),
                const SizedBox(height: 16),
                if (_loading) const LinearProgressIndicator(),
                if (!_loading && vendors.isEmpty) const Card(child: ListTile(title: Text('No matching vendors'), subtitle: Text('Try a different search.'))),
                ...vendors.map((vendor) => _VendorDirectoryRow(vendor: vendor)),
                const SizedBox(height: 16),
                Text('Approved vendors: $approved', style: Theme.of(context).textTheme.bodySmall),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label), const SizedBox(height: 6), Text(value, style: Theme.of(context).textTheme.headlineSmall)])));
}

class _VendorDirectoryRow extends StatelessWidget {
  const _VendorDirectoryRow({required this.vendor});

  final AdminVendor vendor;

  @override
  Widget build(BuildContext context) {
    final pending = !vendor.isApproved;
    final status = pending ? 'Pending' : 'Approved';
    final color = pending ? Colors.orange : Colors.green;
    return Card(
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.store)),
        title: Text(vendor.businessName),
        subtitle: Text('${vendor.address} · ${vendor.businessType}'),
        trailing: Text(status, style: TextStyle(color: color, fontWeight: FontWeight.w600)),
        onTap: () => Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => VendorDirectoryDetailScreen(vendor: vendor))),
      ),
    );
  }
}

class VendorDirectoryDetailScreen extends StatelessWidget {
  const VendorDirectoryDetailScreen({super.key, required this.vendor});

  final AdminVendor vendor;

  @override
  Widget build(BuildContext context) {
    final pending = !vendor.isApproved;
    return Scaffold(
      appBar: AppBar(title: Text(vendor.businessName)),
      body: ListView(padding: const EdgeInsets.all(16), children: [
        Card(child: ListTile(title: Text(vendor.businessName), subtitle: Text('${vendor.address}\n${vendor.businessType}'), trailing: Text(pending ? 'Pending' : 'Approved'))),
        const SizedBox(height: 12),
        _DetailRow(label: 'Compliance note', value: vendor.approvalNote ?? 'No open compliance notes'),
        const _DetailRow(label: 'Payout frequency', value: 'Weekly'),
        const _DetailRow(label: 'Avg. daily orders', value: '148'),
        const _DetailRow(label: 'Rating', value: '4.8/5'),
      ]),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Card(child: ListTile(title: Text(label), trailing: Text(value)));
}
