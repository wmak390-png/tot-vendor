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
  bool _signingOut = false;

  bool get _isLiveAccount => SupabaseBootstrap.client?.auth.currentUser != null;
  String get _accountEmail => SupabaseBootstrap.client?.auth.currentUser?.email ?? 'Demo account';

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
          const Center(child: Text('Aarav Sharma', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700))),
          const SizedBox(height: 8),
          Center(child: Text(_accountEmail, style: Theme.of(context).textTheme.bodyMedium)),
          const SizedBox(height: 20),
          _ProfileRow(label: 'Account', value: _isLiveAccount ? 'Connected' : 'Local demo'),
          const _ProfileRow(label: 'Member', value: 'Gold tier'),
          const _ProfileRow(label: 'Phone', value: '+91 98765 43210'),
          const _ProfileRow(label: 'Address', value: '16th Main, Bengaluru'),
          const _ProfileRow(label: 'Saved card', value: 'Visa •••• 1180'),
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
