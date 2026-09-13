import 'package:flutter/material.dart';

import '../../../core/supabase/supabase_bootstrap.dart';

class StaffScreen extends StatefulWidget {
  const StaffScreen({super.key});

  @override
  State<StaffScreen> createState() => _StaffScreenState();
}

class _StaffScreenState extends State<StaffScreen> {
  List<Map<String, dynamic>> _staff = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadStaff();
  }

  Future<void> _loadStaff() async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final vendor = await client.from('vendors').select('id').eq('owner_id', user.id).order('created_at').limit(1).maybeSingle();
      final vendorId = vendor?['id'] as String?;
      if (vendorId == null) {
        if (mounted) setState(() => _loading = false);
        return;
      }
      final rows = await client.from('vendor_staff_memberships').select('id, role, is_active, users(full_name, email)').eq('vendor_id', vendorId).eq('is_active', true).order('created_at');
      if (mounted) {
        setState(() {
          _staff = rows.map((row) => Map<String, dynamic>.from(row)).toList();
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Staff memberships could not be loaded.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final email = SupabaseBootstrap.client?.auth.currentUser?.email ?? 'Owner account';
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: const Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text('TEAM', style: TextStyle(fontSize: 10, letterSpacing: 1.4, fontWeight: FontWeight.w800)), SizedBox(height: 2), Text('Staff roster', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800))]),
        actions: [IconButton(onPressed: _loadStaff, icon: const Icon(Icons.refresh_rounded), tooltip: 'Refresh staff')],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(color: Theme.of(context).colorScheme.secondaryContainer, child: const Padding(padding: EdgeInsets.all(16), child: Text('Role-based access is managed through active vendor staff memberships.'))),
          const SizedBox(height: 16),
          Card(child: ListTile(leading: const CircleAvatar(child: Icon(Icons.verified_user_outlined)), title: const Text('Owner', style: TextStyle(fontWeight: FontWeight.w800)), subtitle: Text(email), trailing: const Text('Full access'))),
          const SizedBox(height: 12),
          if (_loading) const LinearProgressIndicator(),
          if (_error != null) Card(child: ListTile(title: Text(_error!), trailing: IconButton(onPressed: _loadStaff, icon: const Icon(Icons.refresh)))),
          if (!_loading && _error == null && _staff.isEmpty) const Card(child: ListTile(title: Text('No staff members yet'), subtitle: Text('Active staff memberships will appear here once assigned.'))),
          ..._staff.map((member) {
            final profile = member['users'] as Map<String, dynamic>?;
            final name = profile?['full_name'] as String? ?? profile?['email'] as String? ?? 'Staff member';
            final role = (member['role'] as String? ?? 'staff').replaceAll('_', ' ');
            return Card(margin: const EdgeInsets.only(top: 12), child: ListTile(leading: const CircleAvatar(child: Icon(Icons.person_rounded)), title: Text(name), subtitle: Text(role), trailing: const Text('Active', style: TextStyle(fontWeight: FontWeight.w700))));
          }),
        ],
      ),
    );
  }
}
