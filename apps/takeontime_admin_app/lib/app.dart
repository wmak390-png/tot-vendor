import 'package:flutter/material.dart';

import 'core/supabase/auth_gate.dart';
import 'core/theme/tot_theme.dart';
import 'features/approvals/screens/approvals_screen.dart';
import 'features/audit/screens/audit_screen.dart';
import 'features/directory/screens/directory_screen.dart';
import 'features/finance/screens/finance_screen.dart';
import 'features/settings/screens/settings_screen.dart';

class AdminApp extends StatelessWidget {
  const AdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TakeOnTime Admin',
      debugShowCheckedModeBanner: false,
      theme: TotTheme.adminTheme,
      home: const AdminAuthGate(child: AdminShell()),
    );
  }
}

class AdminShell extends StatefulWidget {
  const AdminShell({super.key});

  @override
  State<AdminShell> createState() => _AdminShellState();
}

class _AdminShellState extends State<AdminShell> {
  int _index = 0;

  final screens = [
    const ApprovalsScreen(),
    const DirectoryScreen(),
    const FinanceScreen(),
    const AuditScreen(),
    const SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.approval), label: 'Approvals'),
          NavigationDestination(icon: Icon(Icons.storefront), label: 'Directory'),
          NavigationDestination(icon: Icon(Icons.account_balance_wallet_outlined), label: 'Finance'),
          NavigationDestination(icon: Icon(Icons.history_edu_rounded), label: 'Audit'),
          NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }
}
