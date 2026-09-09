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

  Future<void> signOut() => _client.auth.signOut();
}
