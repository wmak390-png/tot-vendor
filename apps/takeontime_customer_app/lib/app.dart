import 'package:flutter/material.dart';

import 'core/supabase/auth_gate.dart';
import 'core/theme/tot_theme.dart';
import 'features/alerts/screens/alerts_screen.dart';
import 'features/discover/screens/discover_screen.dart';
import 'features/orders/screens/orders_screen.dart';
import 'features/plans/screens/plans_screen.dart';
import 'features/profile/screens/profile_screen.dart';

class CustomerApp extends StatelessWidget {
  const CustomerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TakeOnTime Customer',
      debugShowCheckedModeBanner: false,
      theme: TotTheme.customerTheme,
      home: const CustomerAuthGate(child: CustomerShell()),
    );
  }
}

class CustomerShell extends StatefulWidget {
  const CustomerShell({super.key});

  @override
  State<CustomerShell> createState() => _CustomerShellState();
}

class _CustomerShellState extends State<CustomerShell> {
  int _index = 0;

  final screens = [
    const DiscoverScreen(),
    const PlansScreen(),
    const OrdersScreen(),
    const AlertsScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search_outlined), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.calendar_month_outlined), label: 'Meal plans'),
          NavigationDestination(icon: Icon(Icons.shopping_bag_outlined), label: 'Orders'),
          NavigationDestination(icon: Icon(Icons.notifications_none), label: 'Alerts'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
        ],
      ),
    );
  }
}
