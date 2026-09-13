import 'package:flutter/material.dart';

import '../../../core/supabase/auth_repository.dart';
import '../../../core/supabase/supabase_bootstrap.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _authRepository = const AuthRepository();
  String _fullName = 'Aarav Sharma';
  String _phone = '+91 98765 43210';
  bool _loadingProfile = true;
  bool _savingProfile = false;
  bool _signingOut = false;

  bool get _isLiveAccount => SupabaseBootstrap.client?.auth.currentUser != null;
  String get _accountEmail => SupabaseBootstrap.client?.auth.currentUser?.email ?? 'Demo account';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _authRepository.fetchProfile();
      if (mounted && profile != null) {
        setState(() {
          _fullName = profile['full_name'] as String? ?? _fullName;
          _phone = profile['phone'] as String? ?? _phone;
        });
      }
    } finally {
      if (mounted) setState(() => _loadingProfile = false);
    }
  }

  Future<void> _editProfile() async {
    final name = TextEditingController(text: _fullName);
    final phone = TextEditingController(text: _phone);
    final values = await showModalBottomSheet<List<String>>(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        final bottom = MediaQuery.viewInsetsOf(context).bottom;
        return Padding(
          padding: EdgeInsets.fromLTRB(16, 20, 16, bottom + 16),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text('Edit profile', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextField(controller: name, decoration: const InputDecoration(labelText: 'Full name', border: OutlineInputBorder())),
            const SizedBox(height: 12),
            TextField(controller: phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone', border: OutlineInputBorder())),
            const SizedBox(height: 16),
            FilledButton(onPressed: () => Navigator.pop(context, [name.text.trim(), phone.text.trim()]), child: const Text('Save profile')),
          ]),
        );
      },
    );
    name.dispose();
    phone.dispose();
    if (values == null || values.any((value) => value.isEmpty) || !_isLiveAccount) return;
    setState(() => _savingProfile = true);
    try {
      await _authRepository.updateProfile(fullName: values[0], phone: values[1]);
      if (mounted) {
        setState(() {
          _fullName = values[0];
          _phone = values[1];
        });
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated.')));
      }
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not update profile.')));
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
        child: ListView(padding: const EdgeInsets.all(16), children: [
          const CircleAvatar(radius: 42, backgroundColor: Color(0xFFE7F9EE), child: Icon(Icons.person, size: 42, color: Colors.green)),
          const SizedBox(height: 16),
          Center(child: Text(_fullName, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700))),
          const SizedBox(height: 8),
          Center(child: Text(_accountEmail, style: Theme.of(context).textTheme.bodyMedium)),
          const SizedBox(height: 20),
          _ProfileRow(label: 'Account', value: _isLiveAccount ? 'Connected' : 'Local demo'),
          _ProfileRow(label: 'Phone', value: _phone),
          const _ProfileRow(label: 'Pickup location', value: 'Choose from Discover'),
          const SizedBox(height: 16),
          OutlinedButton.icon(onPressed: _loadingProfile || _savingProfile || !_isLiveAccount ? null : _editProfile, icon: const Icon(Icons.edit_outlined), label: Text(_savingProfile ? 'Saving...' : 'Edit profile')),
          const SizedBox(height: 16),
          OutlinedButton.icon(onPressed: _signingOut ? null : _signOut, icon: _signingOut ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.logout), label: Text(_isLiveAccount ? 'Sign out' : 'Demo account')),
        ]),
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
