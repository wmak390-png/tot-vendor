class SupabaseConfig {
  const SupabaseConfig._();

  static const url = String.fromEnvironment('SUPABASE_URL', defaultValue: '');

  static String get anonKey {
    final publishableKey = const String.fromEnvironment(
      'SUPABASE_PUBLISHABLE_KEY',
      defaultValue: '',
    );
    if (publishableKey.isNotEmpty) {
      return publishableKey;
    }
    return const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: '',
    );
  }

  static bool get isConfigured => url.isNotEmpty && anonKey.isNotEmpty;
}
