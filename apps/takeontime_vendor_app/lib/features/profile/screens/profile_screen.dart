import 'package:flutter/material.dart';

import '../../../core/supabase/auth_repository.dart';
import '../../../core/supabase/supabase_bootstrap.dart';
import '../../store/data/vendor_operations_repository.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authRepository = const AuthRepository();
  final _repository = const VendorOperationsRepository();
  String? _vendorId;
  String _businessName = 'Little Fern Kitchen';
  String _businessType = 'Veg & healthy bowls';
  String _address = 'Bengaluru';
  String _merchantId = '#882910';
  String _approvalStatus = 'Demo workspace';
  bool _loading = true;
  bool _savingProfile = false;
  bool _signingOut = false;

  String get _accountEmail => SupabaseBootstrap.client?.auth.currentUser?.email ?? 'Demo account';
  bool get _isLiveAccount => SupabaseBootstrap.client?.auth.currentUser != null;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final vendor = await _repository.fetchOwnedVendor();
      if (mounted && vendor != null) {
        setState(() {
          _vendorId = vendor['id'] as String?;
          _businessName = vendor['business_name'] as String? ?? _businessName;
          _businessType = vendor['business_type'] as String? ?? _businessType;
          _address = vendor['address'] as String? ?? _address;
          _merchantId = vendor['merchant_id'] as String? ?? _merchantId;
          _approvalStatus = vendor['is_approved'] == true ? 'Approved' : 'Pending approval';
        });
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _editProfile() async {
    final name = TextEditingController(text: _businessName);
    final type = TextEditingController(text: _businessType);
    final address = TextEditingController(text: _address);
    final values = await showModalBottomSheet<List<String>>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        final bottom = MediaQuery.viewInsetsOf(context).bottom;
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, bottom + 16),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text('Edit business profile', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Business name', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: type, decoration: const InputDecoration(labelText: 'Business type', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: address, decoration: const InputDecoration(labelText: 'Address', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            FilledButton(onPressed: () => Navigator.pop(context, [name.text.trim(), type.text.trim(), address.text.trim()]), child: const Text('Save profile')),
          ]),
        );
      },
    );
    name.dispose();
    type.dispose();
    address.dispose();
    if (values == null || values.any((value) => value.isEmpty)) return;
    setState(() => _savingProfile = true);
    try {
      final vendor = _vendorId == null
          ? await _repository.createOwnedVendor(businessName: values[0], businessType: values[1], address: values[2])
          : null;
      if (_vendorId == null) {
        _vendorId = vendor?['id'] as String?;
      } else {
        await _repository.updateVendorProfile(vendorId: _vendorId!, businessName: values[0], businessType: values[1], address: values[2]);
      }
      if (mounted) {
        setState(() {
          _businessName = values[0];
          _businessType = values[1];
          _address = values[2];
          _merchantId = vendor?['merchant_id'] as String? ?? _merchantId;
          _approvalStatus = vendor == null ? _approvalStatus : 'Pending approval';
        });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(vendor == null ? 'Business profile updated.' : 'Business profile submitted for approval.')));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not update business profile.')));
    } finally {
      if (mounted) setState(() => _savingProfile = false);
    }
  }

  Future<void> _signOut() async {
    if (!_isLiveAccount) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('This is a local demo account.')));
      return;
    }
    setState(() => _signingOut = true);
    try {
      await _authRepository.signOut();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signed out successfully.')));
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not sign out.')));
    } finally {
      if (mounted) setState(() => _signingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const CircleAvatar(
              radius: 42,
              backgroundColor: Color(0xFFE7F9EE),
              child: Icon(Icons.person, size: 42, color: Colors.green),
            ),
            const SizedBox(height: 16),
            Center(child: Text(_businessName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700))),
            const SizedBox(height: 8),
            Center(child: Text(_accountEmail, style: Theme.of(context).textTheme.bodyMedium)),
            const SizedBox(height: 20),
            _ProfileRow(label: 'Account', value: _isLiveAccount ? 'Connected' : 'Local demo'),
            _ProfileRow(label: 'Business type', value: _businessType),
            _ProfileRow(label: 'Address', value: _address),
            _ProfileRow(label: 'Merchant ID', value: _merchantId),
            _ProfileRow(label: 'Approval', value: _approvalStatus),
            const SizedBox(height: 16),
            OutlinedButton.icon(onPressed: _loading || _savingProfile || !_isLiveAccount ? null : _editProfile, icon: const Icon(Icons.edit_outlined), label: Text(_savingProfile ? 'Saving...' : _vendorId == null ? 'Create business profile' : 'Edit business profile')),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Security', style: TextStyle(fontWeight: FontWeight.w700)),
                    SizedBox(height: 8),
                    Text('Two-factor auth is enabled, and device trust is verified for the store manager account.'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            OutlinedButton.icon(
              onPressed: _signingOut ? null : _signOut,
              icon: _signingOut
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.logout),
              label: Text(_isLiveAccount ? 'Sign out' : 'Demo account'),
            ),
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
  Widget build(BuildContext context) => Card(child: ListTile(title: Text(label), trailing: Text(value)));
}
