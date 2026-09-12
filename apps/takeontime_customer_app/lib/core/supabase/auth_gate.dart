import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'auth_repository.dart';
import 'supabase_bootstrap.dart';

class CustomerAuthGate extends StatelessWidget {
  const CustomerAuthGate({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final client = SupabaseBootstrap.client;
    if (client == null) return child;
    return StreamBuilder<AuthState>(
      stream: client.auth.onAuthStateChange,
      builder: (context, snapshot) => client.auth.currentSession == null ? const CustomerAuthScreen() : child,
    );
  }
}

class CustomerAuthScreen extends StatefulWidget {
  const CustomerAuthScreen({super.key});

  @override
  State<CustomerAuthScreen> createState() => _CustomerAuthScreenState();
}

class _CustomerAuthScreenState extends State<CustomerAuthScreen> {
  final _auth = const AuthRepository();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _signUp = false;
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
      if (_signUp) {
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
                    const Icon(Icons.restaurant, size: 56),
                    const SizedBox(height: 16),
                    Text('Your TakeOnTime account', textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
                    const SizedBox(height: 8),
                    Text(_signUp ? 'Create an account to order from local vendors.' : 'Sign in to see your orders and saved routines.', textAlign: TextAlign.center),
                    const SizedBox(height: 24),
                    TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
                    const SizedBox(height: 12),
                    TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
                    if (_error != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error))),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: _saving ? null : _submit, child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : Text(_signUp ? 'Create account' : 'Sign in')),
                    TextButton(onPressed: _saving ? null : () => setState(() { _signUp = !_signUp; _error = null; }), child: Text(_signUp ? 'Already have an account? Sign in' : 'New here? Create an account')),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
}
