import 'package:supabase_flutter/supabase_flutter.dart';

import 'supabase_bootstrap.dart';

class AuthRepository {
  const AuthRepository();

  SupabaseClient get _client => SupabaseBootstrap.client ?? (throw StateError(
        'Supabase is not configured. Pass SUPABASE_URL and SUPABASE_ANON_KEY.',
      ));

  Stream<AuthState> get authStateChanges => _client.auth.onAuthStateChange;

  User? get currentUser => _client.auth.currentUser;

  Future<void> signIn({required String email, required String password}) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signUp({required String email, required String password}) async {
    await _client.auth.signUp(email: email, password: password);
  }

  Future<Map<String, dynamic>?> fetchProfile() async {
    final user = _client.auth.currentUser;
    if (user == null) return null;
    return _client.from('users').select('full_name, phone, email').eq('id', user.id).maybeSingle();
  }

  Future<void> updateProfile({required String fullName, required String phone}) async {
    final user = _client.auth.currentUser;
    if (user == null) throw StateError('Sign in before updating your profile.');
    await _client.from('users').update({
      'full_name': fullName,
      'phone': phone,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', user.id);
  }

  Future<void> signOut() => _client.auth.signOut();
}
