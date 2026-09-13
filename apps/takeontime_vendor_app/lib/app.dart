import 'package:flutter/material.dart';

import 'core/supabase/auth_gate.dart';
import 'core/theme/tot_theme.dart';
import 'features/dashboard/screens/vendor_dashboard_screen.dart';
import 'features/menu/screens/menu_screen.dart';
import 'features/orders/screens/orders_screen.dart';
import 'features/plans/screens/plans_screen.dart';
import 'features/profile/screens/profile_screen.dart';
import 'features/settlements/screens/settlements_screen.dart';
import 'features/staff/screens/staff_screen.dart';
import 'features/store/screens/store_screen.dart';

class VendorApp extends StatelessWidget {
  const VendorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TakeOnTime Vendor',
      debugShowCheckedModeBanner: false,
      theme: TotTheme.vendorTheme,
      home: const VendorAuthGate(child: VendorShell()),
    );
  }
}

class VendorShell extends StatefulWidget {
  const VendorShell({super.key});

  @override
  State<VendorShell> createState() => _VendorShellState();
}

class _VendorShellState extends State<VendorShell> {
  int _currentIndex = 0;

  static const List<IconData> _icons = [
    Icons.home_outlined,
    Icons.receipt_long_outlined,
    Icons.storefront_outlined,
    Icons.restaurant_menu_outlined,
    Icons.calendar_month_outlined,
    Icons.account_balance_wallet_outlined,
    Icons.groups_rounded,
    Icons.person_outline,
  ];

  static const List<String> _labels = [
    'Dashboard',
    'Orders',
    'Store',
    'Menu',
    'Plans',
    'Settlements',
    'Staff',
    'Profile',
  ];

  @override
  Widget build(BuildContext context) {
    final screens = [
      const VendorDashboardScreen(),
      const OrdersScreen(),
      const StoreScreen(),
      const MenuScreen(),
      const PlansScreen(),
      const SettlementsScreen(),
      const StaffScreen(),
      const ProfileScreen(),
    ];

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: List.generate(
          _icons.length,
          (index) => NavigationDestination(
            icon: Icon(_icons[index]),
            label: _labels[index],
          ),
        ),
      ),
    );
  }
}
