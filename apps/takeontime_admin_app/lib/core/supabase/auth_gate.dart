import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'auth_repository.dart';
import 'supabase_bootstrap.dart';

class AdminAuthGate extends StatelessWidget {
  const AdminAuthGate({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final client = SupabaseBootstrap.client;
    if (client == null) return child;
    return StreamBuilder<AuthState>(
      stream: client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        if (client.auth.currentSession == null) return const AdminAuthScreen();
        return _AdminRoleGate(child: child);
      },
    );
  }
}

class _AdminRoleGate extends StatelessWidget {
  const _AdminRoleGate({required this.child});

  final Widget child;

  Future<bool> _isAdmin() async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) return false;
    final profile = await client.from('users').select('role').eq('id', user.id).maybeSingle();
    return profile?['role'] == 'admin';
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _isAdmin(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Scaffold(body: Center(child: CircularProgressIndicator()));
        if (snapshot.data == true) return child;
        return const _AccessDeniedScreen();
      },
    );
  }
}

class _AccessDeniedScreen extends StatelessWidget {
  const _AccessDeniedScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.lock_outline, size: 48),
              const SizedBox(height: 16),
              Text('Admin access required', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              const Text('This account is not authorized to open the platform console.', textAlign: TextAlign.center),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () => SupabaseBootstrap.client?.auth.signOut(),
                icon: const Icon(Icons.logout),
                label: const Text('Use another account'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class AdminAuthScreen extends StatefulWidget {
  const AdminAuthScreen({super.key});

  @override
  State<AdminAuthScreen> createState() => _AdminAuthScreenState();
}

class _AdminAuthScreenState extends State<AdminAuthScreen> {
  final _auth = const AuthRepository();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _password.text.length < 6) {
      setState(() => _error = 'Enter an email and a password with at least 6 characters.');
      return;
    }
    setState(() { _saving = true; _error = null; });
    try {
      await _auth.signIn(email: _email.text.trim(), password: _password.text);
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('AuthException(message: ', '').replaceFirst(')', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(Icons.admin_panel_settings_outlined, size: 56),
                    const SizedBox(height: 16),
                    Text('TakeOnTime Admin', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    const Text('Sign in with an authorized platform administrator account.', textAlign: TextAlign.center),
                    const SizedBox(height: 24),
                    TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Admin email', border: OutlineInputBorder())),
                    const SizedBox(height: 12),
                    TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                    if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: _saving ? null : _submit, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Sign in')),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
