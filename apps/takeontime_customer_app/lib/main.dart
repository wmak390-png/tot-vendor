import 'package:flutter/material.dart';

import 'app.dart';
import 'core/supabase/supabase_bootstrap.dart';

export 'app.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SupabaseBootstrap.initialize();
  runApp(const CustomerApp());
}
