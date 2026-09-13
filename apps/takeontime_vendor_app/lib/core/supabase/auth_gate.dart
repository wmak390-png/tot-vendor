import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../features/profile/screens/vendor_verification_screen.dart';
import 'auth_repository.dart';
import 'supabase_bootstrap.dart';

class VendorAuthGate extends StatelessWidget {
  const VendorAuthGate({super.key, required this.child});

  final Widget child;

  Future<Map<String, dynamic>?> _fetchVendorStatus() async {
    final client = SupabaseBootstrap.client;
    final user = client?.auth.currentUser;
    if (client == null || user == null) return null;

    final row = await client
        .from('vendors')
        .select('id, is_approved, approval_note')
        .eq('owner_id', user.id)
        .order('created_at')
        .limit(1)
        .maybeSingle();

    return row == null ? null : Map<String, dynamic>.from(row);
  }

  @override
  Widget build(BuildContext context) {
    final client = SupabaseBootstrap.client;
    if (client == null) return child;
    return StreamBuilder<AuthState>(
      stream: client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        if (client.auth.currentSession == null) {
          return const AuthScreen(roleLabel: 'Vendor workspace');
        }

        return FutureBuilder<Map<String, dynamic>?>(
          future: _fetchVendorStatus(),
          builder: (context, vendorSnapshot) {
            if (!vendorSnapshot.hasData) {
              return const Scaffold(body: Center(child: CircularProgressIndicator()));
            }
            final vendor = vendorSnapshot.data;
            final isApproved = vendor?['is_approved'] == true;
            final isRejected = vendor != null && vendor['is_approved'] == false && vendor['approval_note'] != null;
            if (isApproved) return child;
            return VendorVerificationScreen(
              isRejected: isRejected,
              reason: vendor?['approval_note'] as String?,
            );
          },
        );
      },
    );
  }
}

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.roleLabel});

  final String roleLabel;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _auth = const AuthRepository();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _isSignUp = false;
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
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      if (_isSignUp) {
        await _auth.signUp(email: _email.text.trim(), password: _password.text);
      } else {
        await _auth.signIn(email: _email.text.trim(), password: _password.text);
      }
    } catch (error) {
      if (mounted) setState(() => _error = error.toString().replaceFirst('AuthException(message: ', '').replaceFirst(')', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.storefront, size: 56),
                  const SizedBox(height: 16),
                  Text(widget.roleLabel, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
                  const SizedBox(height: 8),
                  Text(_isSignUp ? 'Create your account to manage your store.' : 'Sign in to continue to your store operations.', textAlign: TextAlign.center),
                  const SizedBox(height: 24),
                  TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
                  const SizedBox(height: 12),
                  TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                  if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: _saving ? null : _submit, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(_isSignUp ? 'Create account' : 'Sign in')),
                  TextButton(onPressed: _saving ? null : () => setState(() { _isSignUp = !_isSignUp; _error = null; }), child: Text(_isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account')),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

